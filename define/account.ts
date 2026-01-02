import * as v from 'valibot';
import { column, entity, manyToMany } from '@piying/orm/typeorm';
import { RoleGroup } from './role';
import {
  actions,
  asControl,
  asVirtualGroup,
  changeObject,
  formConfig,
  layout,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';
import { BaseSchema } from './schema';
import * as bcrypt from 'bcryptjs';
import { ApiType, CurdType } from './type';
import { metadataList } from '@piying/valibot-visit';
import { ReadOnlyId, ReadOnlyIdFn } from './const.action';
const PwdConfig = metadataList<any>([
  actions.attributes.set({ type: 'password' }),
  formConfig({
    transfomer: {
      toModel(value, control) {
        return bcrypt.hashSync(value, '$2b$10$0XjzBKpETxwGN.I.PquC5O');
      },
    },
  }),
]);
export const Account = v.pipe(
  v.object({
    ...BaseSchema.entries,
    username: v.pipe(v.string(), v.title('用户名'), column({ length: 50 })),
    password: v.pipe(
      v.string(),
      v.title('密码'),
      column({ length: 50, select: false }),
      PwdConfig,
    ),
    mobile: v.pipe(
      v.optional(v.string()),
      v.title('手机号码'),
      column({ length: 20 }),
    ),
    email: v.pipe(
      v.string(),
      v.title('邮箱'),
      v.email(),
      column({ length: 50, unique: true }),
    ),
    isSuper: v.pipe(v.optional(v.number(), 0)),
    roleGroupList: v.pipe(
      v.lazy(() => v.array(RoleGroup)),
      manyToMany({ target: () => RoleGroup, joinTable: true }),
    ),
  }),
  entity({ tableName: 'account' }),
);
export const Account_Save = changeObject(
  v.pick(Account.pipe[0], ['id', 'mobile', 'email']),
  { id: ReadOnlyIdFn },
);
export const SetAccountChildren_Save = v.pipe(
  v.object({
    id: ReadOnlyId,
    roleGroupList: v.pipe(
      v.array(v.string()),
      asControl(),
      setComponent('checkboxList'),
      actions.inputs.patch({ options: [] }),
      actions.inputs.patchAsync({
        options: async (field) => {
          const trpc = field.context.trpc as ApiType;
          const result = await trpc.roleGroup.find.mutate({});
          return result.list.map((item) => {
            return { label: item.name, value: item.id };
          });
        },
      }),
    ),
  }),
);
export type AccountOutputType = v.InferOutput<typeof Account>;
export const ChangePassword = v.object({
  oldPassword: v.string(),
  password: v.string(),
  password2: v.string(),
});

export const RegisterAccountDefine = v.pipe(
  changeObject(
    v.object({
      ...v.pick(Account.pipe[0], ['username', 'password', 'email']).entries,
      password2: v.string(),
    }),
    {
      password: (schema) => v.pipe(schema, layout({ priority: 1 })),
      password2: (schema) =>
        v.pipe(
          schema,
          layout({ priority: 1 }),
          v.title('重复输入密码'),
          PwdConfig,
        ),
    },
  ),
  v.forward(
    v.partialCheck(
      [['password'], ['password2']],
      (input) => input.password === input.password2,
      '密码两次输入不一致',
    ),
    ['password2'],
  ),
);
export type RegisterAccountOutput = v.InferOutput<typeof RegisterAccountDefine>;

export const Login_View = v.pipe(
  v.intersect([
    v.pipe(
      v.pick(Account.pipe[0], ['username', 'password']),
      setComponent('label-group'),
    ),
    v.pipe(
      NFCSchema,
      setComponent('button'),
      actions.inputs.set({ label: '登录', buttonType: 'submit' }),
    ),
  ]),
  asVirtualGroup(),
  actions.wrappers.patch([
    {
      type: 'form',
      attributes: {
        class:
          'flex min-w-0 flex-auto flex-col items-center sm:justify-center h-full',
      },
      outputs: {
        submited: (field: any) => {
          return field.context.login(field.form.root.value$$());
        },
      },
    },
    {
      type: 'block',
      attributes: {
        class: 'flex min-w-0 flex-auto flex-col items-center sm:justify-center',
      },
    },
    {
      type: 'block',
      attributes: {
        class:
          'w-full px-4 py-8 sm:bg-card sm:w-auto sm:rounded-2xl sm:p-12 sm:shadow ',
      },
    },
    {
      type: 'block',
      attributes: { class: 'mx-auto w-full max-w-80 sm:mx-0 sm:w-80' },
    },
  ]),
);

export const Account_View = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        table: v.pipe(
          NFCSchema,
          setComponent('table'),
          actions.inputs.set({
            searchParams: undefined,
          }),
          actions.inputs.patchAsync({
            service: (field) => {
              const trpc = field.context.trpc as ApiType;
              return {
                find: (input) => trpc.account.find.mutate(input),
                save: (input) => {
                  if (input.id) {
                    return trpc.account.save.mutate(input);
                  }
                  return trpc.account.register.mutate(input);
                },
                remove: (info) => trpc.account.remove.mutate(info.id),
              } as CurdType;
            },
            defineColumn: () => {
              return [
                {
                  header: '用户名',
                  key: 'username',
                  sortable: true,
                },
                {
                  header: '手机号码',
                  key: 'mobile',
                },
                {
                  header: '邮箱',
                  key: 'email',
                },
                {
                  header: '创建时间',
                  key: 'createdAt',
                  content: {
                    type: 'date',
                    format: 'yyyy-MM-dd HH:mm',
                  },
                },
                {
                  header: '更新时间',
                  key: 'updateAt',
                  content: {
                    type: 'date',
                    format: 'yyyy-MM-dd HH:mm',
                  },
                },
              ];
            },
            createSchema: () => RegisterAccountDefine,
            action: (field) => {
              const trpc = field.context.trpc as ApiType;
              return [
                { type: 'edit', icon: 'edit', schema: Account_Save },
                {
                  type: 'schemaItem',
                  icon: 'settings',
                  description: '设置权限组',
                  schema: SetAccountChildren_Save,
                  save: (data: any) => {
                    return trpc.account.setRoleGroup.mutate(data);
                  },
                  getData: async (data: any) => {
                    const list = await trpc.account.getRoleGroup.mutate(
                      data.id,
                    );
                    return {
                      id: data.id,
                      roleGroupList: list.map((item) => {
                        return item.id;
                      }),
                    };
                  },
                },
                { type: 'delete', icon: 'delete' },
              ];
            },
          }),
        ),
      }),
    ),
  ]),
  asVirtualGroup(),
);
