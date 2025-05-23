import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@monorepo/shared';
export const trpc = createTRPCReact<AppRouter>();
