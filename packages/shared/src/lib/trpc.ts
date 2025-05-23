import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export function createContext(opts:  CreateExpressContextOptions) {
  return {
    req: opts.req,
    res: opts.res
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;


export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const router = t.router;




