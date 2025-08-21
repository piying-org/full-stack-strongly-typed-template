import { inject } from 'static-injector';

import { In } from 'typeorm';

import * as v from 'valibot';
import { DATA_SOURCE } from '../../token';
import {
  IpLimitMiddleware,
  RootProcedure,
  router,
  SuperProcedure,
  UserFailMiddlewareFactory,
  VerifyProcedure,
} from '@@router';
import { CustomError } from '@@domain/error/error';
import {
  Account,
  Account_Save,
  ChangePassword,
  RegisterAccountDefine,
  RegisterAccountOutput,
  RoleGroupOutputType,
  SetAccountChildren_Save,
} from '@project/define';
import { DataSourceService } from '../../service/data-source.service';
import { ID } from '../../type/entity.type';
import { EntitySchemaObjectToken } from '../../create-define';
import { CustomFindOptions, parseDefine } from '@@domain/search/type';
export class AccountService {
  #dataSource = inject(DATA_SOURCE);
  #entitySchema = inject(EntitySchemaObjectToken);
  #repo = this.#dataSource.getRepository(this.#entitySchema.Account);
  #roleGroup = this.#dataSource.getRepository(this.#entitySchema.RoleGroup);
  #dsService = inject(DataSourceService);
  router = router({
    login: RootProcedure.input(
      v.pick(Account.pipe[0], ['username', 'password']),
    )
      .use(
        UserFailMiddlewareFactory(
          3600_000 * 4,
          5,
          // 重复问题
          new CustomError({ code: 'TOO_MANY_REQUESTS' }, { value: 300 }),
        ),
      )
      .mutation(async ({ input, ctx }) => {
        const data = await this.#repo.findOne({
          where: { username: input.username },
          select: { password: true, id: true },
          relations: { roleGroupList: true },
        });
        if (data && input.password === data.password) {
          const result = await this.#roleGroup.find({
            where: {
              id: In(data.roleGroupList.map((item) => item.id)),
            },
            relations: {
              children: true,
            },
          });
          return {
            token: ctx.jwt.sign({ username: data!.username, id: data!.id }),
            roleList: result.flatMap((item) => item.children),
          };
        }

        throw new CustomError(
          {
            message: '账户名或密码错误',
            code: 'BAD_REQUEST',
          },
          { value: 301 },
        );
      }),
    register: RootProcedure.use(IpLimitMiddleware)
      .input(RegisterAccountDefine)
      .mutation(async ({ input }) => this.register(input)),
    // self: VerifyProcedure.mutation(({ input, ctx }) => {
    //   const account = cloneDeep(ctx.account);
    //   unset(account, 'password');
    //   unset(account, 'isSuper');
    //   return account;
    // }),
    // changeItem: VerifyProcedure.input(ChangeAccountItemDefine).mutation(async ({ input }) => {}),
    // // todo 需要邮箱
    // forgotPassword: RootProcedure.input(ForgotPasswordDefine).mutation(async ({ input }) => {
    //   // todo 需要发邮件
    // }),
    // todo 需要邮箱和一个token
    // forgotChangePassword: RootProcedure.mutation(() => {}),
    changePassword: VerifyProcedure.input(ChangePassword).mutation(
      async ({ input, ctx }) => {
        const token = ctx.jwt.decode(ctx.req.headers['jwt'] as string);
        // todo token类型
        const item = (await this.#repo.findOne({
          where: { username: '', password: input.oldPassword },
        }))!;
        return this.#repo.save({ ...item, password: input.password });
      },
    ),
    removeUserItem: SuperProcedure.input(v.object({ id: v.string() })).mutation(
      async ({ input, ctx }) => {
        const item = await this.#repo.findOne({
          where: { id: input.id },
        });
        if (!item) {
          return;
        }
        await this.#repo.remove(item);
      },
    ),
    find: SuperProcedure.input(
      v.custom<CustomFindOptions<'Account'>>(Boolean),
    ).mutation(async ({ input, ctx }) => {
      const where = input.where ? parseDefine(input.where) : undefined;
      const result = await this.#repo.findAndCount({
        ...input,
        where: where,
      });
      return {
        list: result[0],
        count: result[1],
      };
    }),
    save: SuperProcedure.input(Account_Save).mutation(
      async ({ input, ctx }) => {
        return this.#repo.save(input);
      },
    ),
    remove: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        return this.#repo.remove(this.#repo.create({ id: input }));
      },
    ),
    setRoleGroup: SuperProcedure.input(SetAccountChildren_Save).mutation(
      async ({ input, ctx }) => {
        const childrenList = await this.#roleGroup.find({
          where: { id: In(input.roleGroupList) },
        });
        return this.#repo.save({ id: input.id, roleGroupList: childrenList });
      },
    ),
    getRoleGroup: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        const result = await this.#repo.findOne({
          where: { id: input },
          relations: { roleGroupList: true },
        });
        return result!.roleGroupList;
      },
    ),
  });
  async #mergeRoleGroup(list: RoleGroupOutputType[]) {
    list = await this.#roleGroup.find({
      where: { id: In(list.map((item) => item.id)) },
      relations: { children: true },
    });
    const children = list.flatMap((item) => item.children);
    return children;
  }
  getAccount(id: ID) {
    return this.#repo.findOne({
      where: { id: id },
    });
  }
  async hasRole(entity: v.InferOutput<typeof Account>, path: string) {
    if (entity.isSuper) {
      return true;
    }
    const list = await this.#mergeRoleGroup(entity.roleGroupList);
    return list.some((item) => item.id === path);
  }
  async register(input: RegisterAccountOutput) {
    const baseRoleGroup = (await this.#roleGroup.findOne({
      where: { name: '基础' },
    }))!;
    return this.#repo.save(
      this.#repo.create({
        ...input,
        roleGroupList: [baseRoleGroup],
      }),
    );
  }
}
