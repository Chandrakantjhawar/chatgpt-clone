// src/server/trpc/router.ts
import { t } from './trpc';
import { chatRouter } from './routers/chatRouter';

export const appRouter = t.router({
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new Error('UNAUTHORIZED');
  return next({ ctx });
});
