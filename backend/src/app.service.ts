import { Injectable, Injector, inject } from 'static-injector';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify, { FastifyInstance } from 'fastify';
import { t } from './router';

import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';

import { createDefineInjector } from './create-define';
import { AccountService } from '@@domain/account/account.service';
import { VersionService } from '@@domain/crud/version.service';
import { VersionAssetService } from '@@domain/crud/version-asset.service';
import { RoleService } from '@@domain/crud/role.service';
import { RoleGroupService } from '@@domain/crud/role-group.service';
declare const ENV: string;
@Injectable()
export class AppService {
  injector = inject(Injector);

  async bootstrap() {
    const server = fastify({
      maxParamLength: 5000,
      bodyLimit: 10 * 1024 * 1024,
      logger:
        ENV === 'dev'
          ? {
              base: undefined,
              transport: {
                targets: [
                  // {
                  //   level: 'info',
                  //   target: 'pino/file',
                  //   options: {
                  //     destination: path.join(process.cwd(), './log/output'),
                  //     maxWrite: 1,
                  //   },
                  // },
                  {
                    level: 'trace',
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                    },
                  },
                ],
              },
            }
          : true,
    });
    server.register(fastifyTRPCPlugin, {
      prefix: '/api',
      trpcOptions: {
        router: await this.getRouter(),
        createContext: await this.#createContext(server),
      },
    });

    // 由于是插件,必须开启跨域
    server.register(fastifyCors, {});

    server.register(fastifyJwt, { secret: 'CODE_FACTORY_SERVER' });
    try {
      await server.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
      server.log.error(err);
      console.error(err);
    }
  }

  async #createContext<T extends FastifyInstance>(server: T) {
    return (opts: CreateFastifyContextOptions) => ({
      injector: this.injector,
      req: opts.req,
      log: opts.req.log,
      jwt: server.jwt,
    });
  }
  async getRouter() {
    this.injector = await createDefineInjector(this.injector);
    return t.router({
      account: this.injector.get(AccountService).router,
      role: this.injector.get(RoleService).router,
      roleGroup: this.injector.get(RoleGroupService).router,
      version: this.injector.get(VersionService).router,
      versionAsset: this.injector.get(VersionAssetService).router,
    });
  }
}
