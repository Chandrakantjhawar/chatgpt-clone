import { getSession } from '@auth0/nextjs-auth0/edge';
import { createClient } from '@supabase/supabase-js';

export async function createTRPCContext(opts: { req: Request }) {
  const res = new Response();
  const session = await getSession(opts.req, res);

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
