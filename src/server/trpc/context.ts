import { getSession } from '@auth0/nextjs-auth0/edge';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function createTRPCContext({ req }: { req: NextRequest }) {
  const session = await getSession(req, new NextResponse());

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
