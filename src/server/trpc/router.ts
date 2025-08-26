import { t } from './trpc';
import { chatRouter } from './routers/chatRouter';

export const appRouter = t.router({
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
