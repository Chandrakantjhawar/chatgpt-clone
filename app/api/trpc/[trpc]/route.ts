// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

// Edge-style handler
export const GET = (req: Request) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export const POST = GET;
