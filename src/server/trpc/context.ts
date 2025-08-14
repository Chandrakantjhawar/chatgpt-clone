// src/server/trpc/context.ts
import { getSession } from '@auth0/nextjs-auth0/edge';
import { createClient } from '@supabase/supabase-js';

export async function createTRPCContext({ req }: { req: Request }) {
  // Get Auth0 session (Edge runtime)
  const session = await getSession(req);

  // Create Supabase client (server-side only)
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

// Context type for tRPC
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
