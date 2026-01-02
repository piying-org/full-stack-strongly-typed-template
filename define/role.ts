import * as v from 'valibot';
import { BaseSchema } from './schema';
import { column, manyToMany } from '@piying/orm/core';
import {
  actions,
  asVirtualGroup,
  formConfig,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';
import { ApiType, CurdType } from './type';
import {
  asControl,
  changeObject,
  metadataList,
  omitIntersect,
} from '@piying/valibot-visit';
import { ReadOnlyId, ReadOnlyIdFn } from './const.action';
const CheckBoxConfig = metadataList<any>([
  setComponent('checkbox'),
  formConfig({
    transfomer: {
      toView(value, control) {
        return value === 1;
      },
      toModel(value, control) {
        return value ? 1 : 0;
      },
    },
  }),
]);
export const RoleGroup = v.pipe(
  v.intersect([
    v.object({
      name: v.pipe(v.string(), v.title('权限组'), column({ length: 50 })),
      description: v.pipe(v.string(), v.title('描述'), column({ length: 50 })),
      type: v.pipe(
        v.optional(v.number(), 0),
        v.description('用户组类型0系统,1用户'),
        column({}),
        CheckBoxConfig,
      ),
      children: v.pipe(
        v.lazy(() => v.array(Role)),
        manyToMany({ target: () => Role, joinTable: true }),
      ),
    }),
    BaseSchema,
  ]),
);
export const RoleGroup_Save = changeObject(
  omitIntersect(RoleGroup.pipe[0], ['updateAt', 'createdAt', 'children']),
  { id: ReadOnlyIdFn },
);

export type RoleGroupOutputType = v.InferOutput<typeof RoleGroup>;

export const Role = v.pipe(
  v.intersect([
    v.object({
      name: v.pipe(v.string(), v.title('权限名'), column({ length: 50 })),
      description: v.pipe(v.string(), v.title('描述'), column({ length: 50 })),
      type: v.pipe(
        v.optional(v.number(), 0),
        v.title('类型'),
        v.description('0通用,1:表示接口(API),2:网页使用'),
        column({}),
        setComponent('checkbox'),
        CheckBoxConfig,
      ),
      isDefault: v.pipe(
        v.optional(v.number(), 0),
        v.title('默认权限'),
        column({}),
        setComponent('checkbox'),
        formConfig({
          transfomer: {
            toView(value, control) {
              return value === 1;
            },
            toModel(value, control) {
              return value ? 1 : 0;
            },
          },
        }),
      ),
    }),
    BaseSchema,
  ]),
);
export type RoleOutputType = v.InferOutput<typeof Role>;
export const Role_Save = changeObject(
  omitIntersect(Role.pipe[0], ['updateAt', 'createdAt']),
  { id: ReadOnlyIdFn },
);
export const SetRoleGroupChildren_Save = v.pipe(
  v.object({
    id: ReadOnlyId,
    children: v.pipe(
      v.array(v.string()),
      asControl(),
      setComponent('checkboxList'),
      actions.inputs.patch({ options: [] }),
      actions.inputs.patchAsync({
        options: async (field) => {
          const trpc = field.context.trpc as ApiType;
          const result = await trpc.role.find.mutate({});
          return result.list.map((item) => {
            return { label: item.name, value: item.id };
          });
        },
      }),
    ),
  }),
);

export const Role_View = v.pipe(
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
                find: (input) => trpc.role.find.mutate(input),
                save: (input) => {
                  return trpc.role.save.mutate(input);
                },
                remove: (info) => {
                  return trpc.role.remove.mutate(info.id);
                },
              } as CurdType;
            },
            defineColumn: () => {
              return [
                {
                  header: '权限名',
                  key: 'name',
                  sortable: true,
                },
                {
                  header: '描述',
                  key: 'description',
                },
                {
                  header: '类型',
                  key: 'type',
                  content: {
                    type: 'enum',
                    enum: ['接口', '视图'],
                  },
                },
                {
                  header: '默认权限',
                  key: 'isDefault',
                  content: {
                    type: 'enum',
                    enum: ['否', '是'],
                  },
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
            createSchema: () => {
              return Role_Save;
            },
            action: (field) => {
              return [
                { type: 'edit', icon: 'edit', schema: Role_Save },
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
export const RoleGroup_View = v.pipe(
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
                find: (input) => trpc.roleGroup.find.mutate(input),
                save: (input) => {
                  return trpc.roleGroup.save.mutate(input);
                },
                remove: (info) => {
                  return trpc.roleGroup.remove.mutate(info.id);
                },
              } as CurdType;
            },
            defineColumn: () => {
              return [
                {
                  header: '权限组',
                  key: 'name',
                  sortable: true,
                },
                {
                  header: '描述',
                  key: 'description',
                },
                {
                  header: '类型',
                  key: 'type',
                  content: {
                    type: 'enum',
                    enum: ['系统', '用户'],
                  },
                },
                // group
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
            createSchema: () => {
              return RoleGroup_Save;
            },
            action: (field) => {
              const trpc = field.context.trpc as ApiType;
              return [
                { type: 'edit', icon: 'edit', schema: RoleGroup_Save },
                {
                  type: 'schemaItem',
                  icon: 'settings',
                  description: '设置权限',
                  schema: SetRoleGroupChildren_Save,
                  save: (data: any) => {
                    return trpc.roleGroup.setRole.mutate(data);
                  },
                  getData: async (data: any) => {
                    const list = await trpc.roleGroup.getRole.mutate(data.id);
                    return {
                      id: data.id,
                      children: list.map((item) => {
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
