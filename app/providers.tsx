'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '@/trpc/react';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url:
            typeof window !== 'undefined'
              ? '/api/trpc'
              : `${process.env.NEXT_PUBLIC_BASE_URL}/api/trpc`,
          transformer: superjson, // ✅ Move transformer here
        }),
      ],
    })
  );

  return (
    <UserProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </UserProvider>
  );
}
