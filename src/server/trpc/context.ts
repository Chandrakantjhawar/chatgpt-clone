// src/server/trpc/context.ts
import { getSession } from '@auth0/nextjs-auth0/edge';
import { createClient } from '@supabase/supabase-js';

export async function createTRPCContext({ req }: { req: Request }) {
  // Use the Edge version of getSession
  const session = await getSession(req); 

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
