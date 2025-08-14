// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

export const runtime = 'edge'; // required

export const GET = (req: Request) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req } as any),
    endpoint: '/api/trpc', // required for Edge
  });

export const POST = GET;
