import * as v from 'valibot';
import { BaseSchema, StrColumn } from '../schema';
import {
  column,
  columnRelationId,
  entity,
  manyToOne,
  oneToMany,
} from '@piying/orm/core';
import {
  actions,
  asVirtualGroup,
  changeObject,
  NFCSchema,
  outputChange,
  setComponent,
} from '@piying/view-angular-core';
import { valid } from 'semver';
import { ApiType, CurdType } from '../type';
import { ReadOnlyIdFn } from '../const.action';
type Lazy = v.GenericSchema<
  { assets: v.InferInput<typeof VersionAsset_Entity> },
  { assets: v.InferOutput<typeof VersionAsset_Entity> }
>;
export const VersionLazy: Lazy = v.object({
  assets: v.pipe(
    v.lazy(() => VersionAsset_Entity),
    oneToMany({ target: () => VersionAsset_Entity }),
  ),
});
export const VersionCommon = v.object({
  name: v.pipe(
    StrColumn,
    v.title('版本'),
    v.check((item) => {
      return !!valid(item);
    }, '版本格式错误'),
  ),
  channel: v.pipe(
    v.optional(v.picklist(['stable']), 'stable'),
    column(),
    v.title('频道'),
  ),
});
// 实体注册用
export const Version_Entity = v.pipe(
  v.intersect([BaseSchema, VersionLazy, VersionCommon]),
  entity({ tableName: 'version' }),
);
// 保存用
export const Version_Save = v.pipe(
  v.intersect([
    changeObject(v.pick(BaseSchema, ['id']), {
      id: ReadOnlyIdFn,
    }),

    VersionCommon,
  ]),
);

// 保存资源
export const VersionAssetCommon = v.object({
  platform: v.pipe(v.picklist(['win32_x64', 'linux_x64']), v.title('平台')),
  originName: v.pipe(StrColumn, v.title('原始文件名')),
  version: v.pipe(
    v.lazy(() => Version_Entity),
    manyToOne({
      target: () => Version_Entity,
      joinColumn: { name: 'versionId' },
    }),
  ),
  versionId: v.pipe(v.string(), columnRelationId({ relationName: 'version' })),
});
/** 实体 */
export const VersionAsset_Entity = v.pipe(
  v.intersect([BaseSchema, VersionAssetCommon]),
  entity({ tableName: 'versionAsset' }),
);
/** save */
export const VersionAsset_Save = v.pipe(
  v.object({
    ...v.partial(
      changeObject(v.pick(BaseSchema, ['id']), {
        id: ReadOnlyIdFn,
      }),
    ).entries,
    ...v.partial(
      changeObject(v.omit(VersionAssetCommon, ['version']), {
        versionId: ReadOnlyIdFn,
      }),
    ).entries,
  }),
  setComponent('label-group'),
);

export const Version_View = v.pipe(
  v.intersect([
    v.object({
      searchParams: v.pipe(
        v.object({
          name: v.pipe(
            v.optional(v.string()),
            v.title('版本'),
            v.transform((value) => {
              return value ? { operator: 'equal', value } : undefined;
            }),
          ),
          createdAt: v.pipe(
            v.optional(v.any()),
            setComponent('dateRange'),
            v.title('创建时间'),
            v.transform((value) => {
              return { operator: 'between', value: value };
            }),
          ),
        }),
        setComponent('remote-search-group'),
        actions.class.top('noValid'),
        outputChange((fn) => {
          fn([{ list: undefined, output: 'groupChange' }]).subscribe(
            ({ list: [[params]], field }) => {
              field.get(['#', 'table'])?.inputs.update((value) => {
                return { ...value, searchParams: { where: { ...params } } };
              });
            },
          );
        }),
      ),
    }),
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
                find: (input) => trpc.version.find.mutate(input),
                save: (input) => trpc.version.save.mutate(input),
                remove: (info) => trpc.version.remove.mutate(info.id),
              } as CurdType;
            },
            defineColumn: () => {
              return [
                {
                  header: '版本',
                  key: 'name',
                  sortable: true,
                },
                {
                  header: '渠道',
                  key: 'channel',
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
            createSchema: () => Version_Save,
            action: (field) => {
              const trpc = field.context.trpc as ApiType;

              return [
                { type: 'edit', icon: 'edit', schema: Version_Save },
                { type: 'delete', icon: 'delete' },
                {
                  type: 'schemaItem',
                  icon: 'add',
                  description: '添加资源',
                  schema: VersionAsset_Save,
                  save: (data: any) => {
                    return trpc.versionAsset.save.mutate(data);
                  },
                  getData: (data: any) => {
                    return { versionId: data.id };
                  },
                },
                {
                  type: 'schema',
                  schema: VersionAssetView,
                  context: (data: any) => ({
                    ...field.context,
                    versionData: data,
                  }),
                  icon: 'pageview',
                },
              ];
            },
          }),
        ),
      }),
    ),
  ]),
  asVirtualGroup(),
);

/** view */
const VersionAssetView = v.pipe(
  NFCSchema,
  setComponent('table'),
  actions.inputs.set({
    gate: {
      addItem: false,
    },
  }),
  actions.inputs.patchAsync({
    service: (field) => {
      const trpc = field.context.trpc as ApiType;
      const versionData = field.context.versionData;
      return {
        find: (input) =>
          trpc.versionAsset.find.mutate({
            ...input,
            versionId: versionData.id,
          }),
        save: (input) => trpc.versionAsset.save.mutate(input),
        remove: (info) => trpc.versionAsset.remove.mutate(info.id),
      } as CurdType;
    },
    defineColumn: () => {
      return [
        {
          header: '平台',
          key: 'platform',
        },
        {
          header: '文件名',
          key: 'originName',
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
    action: (field) => {
      return [{ type: 'delete', icon: 'delete' }];
    },
  }),
);
