import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@project/backend';
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://127.0.0.1:3000/api',
      headers: (opts) => ({
        jwt: localStorage.getItem('token')!,
      }),
    }),
  ],
});
