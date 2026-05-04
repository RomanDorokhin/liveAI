import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getPet, upsertPet } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Pet persistence — identified by Telegram user ID.
   * No auth required: Telegram Web App passes initData which contains user.id.
   */
  pet: router({
    /** Load pet state + DQN weights for a given Telegram user ID */
    load: publicProcedure
      .input(z.object({ telegramId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        const pet = await getPet(input.telegramId);
        if (!pet) return null;
        return {
          petState: pet.petState,
          modelWeights: pet.modelWeights,
          updatedAt: pet.updatedAt,
        };
      }),

    /** Save pet state + DQN weights for a given Telegram user ID */
    save: publicProcedure
      .input(z.object({
        telegramId: z.string().min(1).max(64),
        petState: z.string().max(100_000),
        modelWeights: z.string().max(500_000),
      }))
      .mutation(async ({ input }) => {
        await upsertPet(input.telegramId, input.petState, input.modelWeights);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
