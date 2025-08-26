<<<<<<< HEAD
# ChatGPT Mobile Clone (Next.js + tRPC + Bootstrap + Supabase + Auth0 + Gemini)

Mobile-only Chat UI using Next.js App Router, tRPC, Bootstrap 5, Supabase (messages), Auth0 (login), and Google Gemini (text + image).

## Quick start

```bash
git clone <this-repo>
cd chatgpt-mobile-clone
cp .env.example .env.local   # fill values
npm install
npm run dev
```

Visit http://localhost:3000 — login with Auth0, then chat. Type `/img a red robot` to generate an image.

## Env vars (.env.local)

- AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only)
- GEMINI_API_KEY

## Supabase schema (run in SQL editor)

```sql
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_sub text not null,
  role text not null check (role in ('user','assistant','image')),
  content text,
  image_url text,
  created_at timestamptz not null default now()
);
create index on messages (user_sub, created_at);
```

## Auth0 setup

- Create a *Regular Web App*.
- Allowed Callback URLs:
  - http://localhost:3000/api/auth/callback
- Allowed Logout URLs:
  - http://localhost:3000/
- Allowed Web Origins:
  - http://localhost:3000

Add the same for your Vercel domain after deployment.

## Deploy to Vercel

- Import repo
- Add all env vars in Project Settings → Environment Variables
- Deploy

```

=======
# chatgpt-clone
>>>>>>> c91394a64d7d4cb26520dbc73d30cd948fadc1ea
# chatgpt-mobile-clone
