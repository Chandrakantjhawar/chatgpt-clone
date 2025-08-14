// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

export const runtime = 'edge'; // required for Vercel Edge

export const GET = (req: Request) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    endpoint: '/api/trpc', // <--- this fixes the error
  });

export const POST = GET;
