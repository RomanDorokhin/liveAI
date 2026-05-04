import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db helpers
vi.mock("./db", () => ({
  getPet: vi.fn(),
  upsertPet: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
}));

import { getPet, upsertPet } from "./db";

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("pet.load", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no pet exists", async () => {
    (getPet as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.pet.load({ telegramId: "12345" });
    expect(result).toBeNull();
  });

  it("returns petState and modelWeights when pet exists", async () => {
    const mockPet = {
      id: 1,
      telegramId: "12345",
      petState: '{"name":"Bytechi","stage":"egg"}',
      modelWeights: '{"weights":[],"stats":{}}',
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    (getPet as ReturnType<typeof vi.fn>).mockResolvedValue(mockPet);
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.pet.load({ telegramId: "12345" });
    expect(result).not.toBeNull();
    expect(result?.petState).toBe(mockPet.petState);
    expect(result?.modelWeights).toBe(mockPet.modelWeights);
  });
});

describe("pet.save", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves pet state and returns success", async () => {
    (upsertPet as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.pet.save({
      telegramId: "12345",
      petState: '{"name":"Bytechi"}',
      modelWeights: '{"weights":[]}',
    });
    expect(result).toEqual({ success: true });
    expect(upsertPet).toHaveBeenCalledWith("12345", '{"name":"Bytechi"}', '{"weights":[]}');
  });

  it("rejects telegramId longer than 64 chars", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.pet.save({
        telegramId: "x".repeat(65),
        petState: "{}",
        modelWeights: "{}",
      })
    ).rejects.toThrow();
  });

  it("rejects petState longer than 100_000 chars", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.pet.save({
        telegramId: "12345",
        petState: "x".repeat(100_001),
        modelWeights: "{}",
      })
    ).rejects.toThrow();
  });
});
