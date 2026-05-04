/**
 * DQN Brain — Deep Q-Network powered by TensorFlow.js
 *
 * Architecture:
 *   Input  (4 neurons): hunger, happiness, energy, health — normalized 0..1
 *   Hidden (16 neurons): Dense + ReLU
 *   Hidden (8 neurons):  Dense + ReLU
 *   Output (4 neurons):  Q-values for [feed, play, sleep, heal]
 *
 * Training: Experience Replay with mini-batches of 32 samples.
 * The model runs entirely in the browser (WebGL backend).
 * Weights are serialized to JSON for server persistence.
 */

import * as tf from "@tensorflow/tfjs";

export type Action = 0 | 1 | 2 | 3; // feed | play | sleep | heal
export const ACTION_NAMES = ["Покормить", "Поиграть", "Уложить спать", "Лечить"];
export const ACTION_ICONS = ["🍖", "⚡", "💤", "💊"];

export interface Experience {
  state: number[];
  action: Action;
  reward: number;
  nextState: number[];
  done: boolean;
}

export interface DQNStats {
  totalDecisions: number;
  totalXP: number;
  epsilon: number;
  loss: number;
  replayBufferSize: number;
  layerWeightSummary: number[][]; // first hidden layer weights summary for visualization
  lastAction: Action;
  lastReward: number;
  mutationCount: number;
  neuralActivity: number[]; // activation values for NeuralNet visualization
}

const GAMMA = 0.95;          // discount factor
const EPSILON_START = 0.9;   // initial exploration rate
const EPSILON_MIN = 0.05;    // minimum exploration rate
const EPSILON_DECAY = 0.9995; // per-decision decay
const BATCH_SIZE = 32;
const REPLAY_BUFFER_MAX = 2000;
const TRAIN_EVERY = 4;       // train every N decisions
const TARGET_UPDATE_EVERY = 50; // update target network every N decisions

export class DQNBrain {
  private model: tf.Sequential;
  private targetModel: tf.Sequential;
  private replayBuffer: Experience[] = [];
  private stats: DQNStats;
  private decisionsSinceLastTrain = 0;

  constructor() {
    this.model = this.buildModel();
    this.targetModel = this.buildModel();
    this.syncTargetModel();

    this.stats = {
      totalDecisions: 0,
      totalXP: 0,
      epsilon: EPSILON_START,
      loss: 0,
      replayBufferSize: 0,
      layerWeightSummary: [],
      lastAction: 0,
      lastReward: 0,
      mutationCount: 0,
      neuralActivity: new Array(16).fill(0),
    };
  }

  private buildModel(): tf.Sequential {
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 16,
      activation: "relu",
      inputShape: [4],
      kernelInitializer: "glorotUniform",
    }));
    model.add(tf.layers.dense({
      units: 8,
      activation: "relu",
      kernelInitializer: "glorotUniform",
    }));
    model.add(tf.layers.dense({
      units: 4,
      activation: "linear",
      kernelInitializer: "glorotUniform",
    }));
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
    });
    return model;
  }

  private syncTargetModel(): void {
    const weights = this.model.getWeights();
    this.targetModel.setWeights(weights);
    weights.forEach(w => w.dispose());
  }

  /** Normalize state values to 0..1 */
  private normalizeState(hunger: number, happiness: number, energy: number, health: number): number[] {
    return [hunger / 100, happiness / 100, energy / 100, health / 100];
  }

  /** Choose action using epsilon-greedy policy */
  async chooseAction(
    hunger: number,
    happiness: number,
    energy: number,
    health: number,
    forceGreedy = false
  ): Promise<{ action: Action; qValues: number[]; activations: number[] }> {
    const state = this.normalizeState(hunger, happiness, energy, health);

    // Epsilon-greedy exploration
    if (!forceGreedy && Math.random() < this.stats.epsilon) {
      const action = Math.floor(Math.random() * 4) as Action;
      return { action, qValues: [0, 0, 0, 0], activations: new Array(16).fill(0) };
    }

    // Greedy: pick action with highest Q-value
    const stateTensor = tf.tensor2d([state]);
    
    // Get intermediate activations for visualization
    const hiddenModel = tf.sequential();
    hiddenModel.add(tf.layers.dense({
      units: 16,
      activation: "relu",
      inputShape: [4],
      weights: (this.model.layers[0] as tf.layers.Layer).getWeights(),
    }));

    const activationsTensor = hiddenModel.predict(stateTensor) as tf.Tensor;
    const activations = Array.from(await activationsTensor.data());

    const qTensor = this.model.predict(stateTensor) as tf.Tensor;
    const qValues = Array.from(await qTensor.data());
    const action = qValues.indexOf(Math.max(...qValues)) as Action;

    // Update neural activity for visualization
    this.stats.neuralActivity = activations;

    stateTensor.dispose();
    qTensor.dispose();
    activationsTensor.dispose();
    hiddenModel.dispose();

    return { action, qValues, activations };
  }

  /** Store experience and optionally train */
  async learn(
    state: number[],
    action: Action,
    reward: number,
    nextState: number[],
    done: boolean
  ): Promise<void> {
    // Store in replay buffer
    this.replayBuffer.push({ state, action, reward, nextState, done });
    if (this.replayBuffer.length > REPLAY_BUFFER_MAX) {
      this.replayBuffer.shift();
    }

    this.stats.totalDecisions++;
    this.stats.totalXP += Math.max(0, reward);
    this.stats.lastAction = action;
    this.stats.lastReward = reward;
    this.stats.replayBufferSize = this.replayBuffer.length;

    // Decay epsilon
    this.stats.epsilon = Math.max(
      EPSILON_MIN,
      this.stats.epsilon * EPSILON_DECAY
    );

    // Train periodically
    this.decisionsSinceLastTrain++;
    if (
      this.replayBuffer.length >= BATCH_SIZE &&
      this.decisionsSinceLastTrain >= TRAIN_EVERY
    ) {
      await this.trainStep();
      this.decisionsSinceLastTrain = 0;
    }

    // Sync target network
    if (this.stats.totalDecisions % TARGET_UPDATE_EVERY === 0) {
      this.syncTargetModel();
    }

    // Update weight summary for visualization
    this.updateWeightSummary();
  }

  private async trainStep(): Promise<void> {
    // Sample random mini-batch
    const batch: Experience[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = Math.floor(Math.random() * this.replayBuffer.length);
      batch.push(this.replayBuffer[idx]);
    }

    const states = batch.map(e => e.state);
    const nextStates = batch.map(e => e.nextState);

    const statesTensor = tf.tensor2d(states);
    const nextStatesTensor = tf.tensor2d(nextStates);

    // Get current Q-values
    const currentQs = this.model.predict(statesTensor) as tf.Tensor;
    const currentQsData = await currentQs.array() as number[][];

    // Get next Q-values from target network
    const nextQs = this.targetModel.predict(nextStatesTensor) as tf.Tensor;
    const nextQsData = await nextQs.array() as number[][];

    // Build target Q-values
    const targetQsData = currentQsData.map((qs, i) => {
      const exp = batch[i];
      const updated = [...qs];
      if (exp.done) {
        updated[exp.action] = exp.reward;
      } else {
        updated[exp.action] = exp.reward + GAMMA * Math.max(...nextQsData[i]);
      }
      return updated;
    });

    const targetTensor = tf.tensor2d(targetQsData);

    // Train
    const history = await this.model.fit(statesTensor, targetTensor, {
      epochs: 1,
      verbose: 0,
      batchSize: BATCH_SIZE,
    });

    const loss = history.history.loss?.[0];
    if (typeof loss === "number") {
      this.stats.loss = loss;
    }

    statesTensor.dispose();
    nextStatesTensor.dispose();
    currentQs.dispose();
    nextQs.dispose();
    targetTensor.dispose();
  }

  private updateWeightSummary(): void {
    try {
      const weights = this.model.layers[0].getWeights();
      if (weights.length > 0) {
        const w = weights[0];
        const data = w.dataSync();
        // Summarize into 4 groups of 4 values (input → first 4 hidden neurons)
        const summary: number[][] = [];
        for (let i = 0; i < 4; i++) {
          const row: number[] = [];
          for (let j = 0; j < 4; j++) {
            row.push(data[i * 16 + j] || 0);
          }
          summary.push(row);
        }
        this.stats.layerWeightSummary = summary;
        weights.forEach(w => w.dispose());
      }
    } catch {
      // ignore
    }
  }

  /** Apply random mutation to weights (simulates biological mutation) */
  async mutate(strength = 0.05): Promise<void> {
    const weights = this.model.getWeights();
    const mutated = weights.map(w => {
      const noise = tf.randomNormal(w.shape as number[], 0, strength);
      const newW = w.add(noise);
      noise.dispose();
      return newW;
    });
    this.model.setWeights(mutated);
    mutated.forEach(w => w.dispose());
    weights.forEach(w => w.dispose());
    this.stats.mutationCount++;
    this.syncTargetModel();
  }

  getStats(): DQNStats {
    return { ...this.stats };
  }

  /** Serialize model weights + stats to plain JSON for server storage */
  async serialize(): Promise<object> {
    const weights = this.model.getWeights();
    const weightData = weights.map(w => ({
      shape: w.shape,
      data: Array.from(w.dataSync()),
    }));
    weights.forEach(w => w.dispose());

    return {
      weights: weightData,
      stats: this.stats,
      replayBuffer: this.replayBuffer.slice(-200), // save last 200 experiences
    };
  }

  /** Restore model from serialized JSON */
  async deserialize(data: {
    weights: { shape: number[]; data: number[] }[];
    stats: DQNStats;
    replayBuffer?: Experience[];
  }): Promise<void> {
    try {
      const tensors = data.weights.map(w =>
        tf.tensor(w.data, w.shape as [number, ...number[]])
      );
      this.model.setWeights(tensors);
      tensors.forEach(t => t.dispose());
      this.syncTargetModel();

      this.stats = { ...this.stats, ...data.stats };
      if (data.replayBuffer) {
        this.replayBuffer = data.replayBuffer;
      }
    } catch (e) {
      console.warn("[DQN] Failed to deserialize weights, starting fresh:", e);
    }
  }

  dispose(): void {
    this.model.dispose();
    this.targetModel.dispose();
  }
}
