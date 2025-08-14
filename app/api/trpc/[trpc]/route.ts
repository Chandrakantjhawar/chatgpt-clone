// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';

export const runtime = 'edge'; // Edge runtime

// Use GET and POST exports
export const GET = async (req: Request) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    endpoint: '/api/trpc', // ⚡ Required in Next.js 14 Edge
  });

export const POST = async (req: Request) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    endpoint: '/api/trpc', // ⚡ Required in Next.js 14 Edge
  });
