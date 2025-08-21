import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import type { FastifyInstance } from 'fastify';
import type { FastifyBaseLogger } from 'fastify';
import type { Injector } from 'static-injector';

export interface ContextType {
  injector: Injector;
  req: CreateFastifyContextOptions['req'];
  log: FastifyBaseLogger;
  jwt: FastifyInstance['jwt'];
  shareAccount: any;
}
