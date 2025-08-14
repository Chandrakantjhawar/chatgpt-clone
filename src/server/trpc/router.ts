import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';
import { chatRouter } from './routers/chatRouter';

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const appRouter = t.router({
  chat: chatRouter,
});
export type AppRouter = typeof appRouter;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new Error('UNAUTHORIZED');
  return next({ ctx });
});
