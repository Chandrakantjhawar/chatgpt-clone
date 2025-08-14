import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { createClient } from '@supabase/supabase-js';

export async function createTRPCContext(opts: { req: NextApiRequest; res: NextApiResponse }) {
  // Get the Auth0 session
  const session = await getSession(opts.req, opts.res);

  // Create a Supabase client (server-side only)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  return {
    user: session?.user || null,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
