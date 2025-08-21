import { TRPCError, initTRPC } from '@trpc/server';
import { ContextType } from '../type/trpc.type';
import { ID } from '../type/entity.type';
import {
  ACCOUNT_FAILED,
  ACCOUNT_UNDEFINED,
  CustomError,
} from '../domain/error/error';
// import { LoggerService } from './domain/logger/logger.service';
import { unset } from 'lodash-es';
import { LimitService } from '@@domain/ip-limit';
import { OverrideProperties } from 'type-fest';
import { AccountService } from '@@domain/account/account.service';
export const t = initTRPC.context<ContextType>().create({
  errorFormatter: (opts) => {
    (opts.shape.data as any).data = (opts.error as any).data || {};
    unset(opts.shape.data, 'stack');
    return opts.shape;
  },
});
export const middleware = t.middleware;
// const Logger = middleware(async (opts) => {
//   let service = opts.ctx.injector.get(LoggerService);
//   // todo 需要等待调用
//   return opts.next();
// });
export const VerifyMiddleware = middleware(async ({ ctx, path, next }) => {
  const token = ctx.req.headers['jwt'] as string | undefined;
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '没有登录' });
  }
  let result: { id: ID };
  try {
    /** 是一个对象,返回内容和时间 */
    result = ctx.jwt.verify(token) as { id: ID };
  } catch (error) {
    throw ACCOUNT_FAILED();
  }
  // todo
  const service = ctx.injector.get(AccountService);
  const entity = await service.getAccount(result.id);
  if (!entity) {
    throw ACCOUNT_UNDEFINED;
  }
  const allow = await service.hasRole(entity, path);
  if (allow) {
    return next({ ctx: { account: entity } });
  }
  throw ACCOUNT_FAILED(path);
});
export const IpLimitMiddleware = middleware(async ({ ctx, path, next }) => {
  const ip = ctx.req.headers['x-real-ip'];
  if (!ip) {
    return next();
  }
  const ipLimitService = ctx.injector.get(LimitService);
  const hasLimit = ipLimitService.getIpLimit(path, ip as string, 1);
  if (hasLimit) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  return next().then((value) => {
    ipLimitService.setIpLimit(path, ip as string, 3600_000);
    return value;
  });
});

export const UserFailMiddlewareFactory = (
  timeout: number,
  times: number,
  error: CustomError,
) =>
  middleware(async ({ ctx, path, next, input }) => {
    const username = (input as any).username as string;
    // if (username === 'root' && ctx.req.headers['super'] !== 'root') {
    //   throw error;
    // }
    const ipLimitService = ctx.injector.get(LimitService);
    const hasLimit = ipLimitService.getUserLimit(path, username, times);
    if (hasLimit) {
      throw error;
    }
    return next()
      .then((value) => {
        if (!value.ok) {
          ipLimitService.setUserLimit(path, username, timeout, times);
        } else {
          ipLimitService.clearUserLimit(path, username);
        }
        return value;
      })
      .catch((reason) => {
        ipLimitService.setUserLimit(path, username, timeout, times);
        throw reason;
      });
  });

export const RootProcedure = t.procedure.use(({ ctx, path, next }) => {
  //每次发布版本时对这里修改,防止异常客户端,可以用semver?
  const version = ctx.req.headers['version'] as string | undefined;
  // if (version !== '1.2.5') {
  //   throw new TRPCError({ code: 'FORBIDDEN', message: 'VERSION' });
  // }
  return next();
});
export const VerifyProcedure = RootProcedure.use(VerifyMiddleware);
export const SuperProcedure = RootProcedure.use(
  middleware(async ({ ctx, path, next }) => {
    const token = ctx.req.headers['jwt'] as string | undefined;
    if (!token) {
      throw ACCOUNT_FAILED();
    }
    let result: { id: ID };
    try {
      /** 是一个对象,返回内容和时间 */
      result = ctx.jwt.verify(token) as { id: ID };
    } catch (error) {
      throw ACCOUNT_FAILED();
    }
    const service = ctx.injector.get(AccountService);
    const entity = await service.getAccount(result.id);
    if (!entity?.isSuper) {
      throw ACCOUNT_FAILED();
    }
    return next();
  }),
);
// .use(Logger);
export const router = t.router;

export type VerifyInput<T> = OverrideProperties<
  Parameters<
    Extract<
      Parameters<(typeof VerifyProcedure)['use']>[0],
      (...args: any[]) => any
    >
  >[0],
  { input: T }
>;
