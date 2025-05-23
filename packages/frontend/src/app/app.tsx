import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from '../router';
import { useState } from 'react';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/trpc';

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            console.error('Error in query cache:', error);
          }
        })
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'https://school-homework-o29e.onrender.com/api/trpc',
          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              authorization: `Bearer ${localStorage.getItem('token') || ''}`
            };
          }
        })
      ]
    })
  );
  return (
    <>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Router />
        </QueryClientProvider>
      </trpc.Provider>
    </>
  );
}

export default App;
