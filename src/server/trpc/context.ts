// src/server/trpc/context.ts
import { getSession } from '@auth0/nextjs-auth0/edge';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function createTRPCContext({ req }: { req: NextRequest }) {
  const session = await getSession(req); // Edge session

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  return {
    user: session?.user ?? null,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
