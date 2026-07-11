import { createTRPCReact } from '@trpc/react-query';
import { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '../../../shared/trpc';

export const trpc = createTRPCReact<AppRouter>();
export type RouterInputs = inferRouterInputs<AppRouter>;
