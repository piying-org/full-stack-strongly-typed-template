import {
  Account,
  Role,
  RoleGroup,
  Version_Entity,
  VersionAsset_Entity,
} from '@project/define';
import { convert, DEFAULT_ORM_CONFIG } from '@piying/orm/typeorm';
import { InjectionToken, Injector, createInjector } from 'static-injector';
import { DATA_SOURCE } from './token';
import { DataSourceOptions, EntitySchema } from 'typeorm';
import path from 'path';
import { AccountService } from '@@domain/account/account.service';
import { VersionService } from '@@domain/crud/version.service';
import { LimitService } from '@@domain/ip-limit';
import { DataSourceService } from './service/data-source.service';
import { VersionAssetService } from '@@domain/crud/version-asset.service';
import { RoleService } from '@@domain/crud/role.service';
import { RoleGroupService } from '@@domain/crud/role-group.service';
export function createDefine(
  injector: Injector,
  options?: Partial<DataSourceOptions>,
) {
  const result = convert(
    {
      Account,
      RoleGroup,
      Role,
      Version: Version_Entity,
      VersionAsset: VersionAsset_Entity,
    },

    {
      dataSourceOptions: {
        type: 'better-sqlite3',
        database: path.join(process.cwd(), '.tmp', 'data.sqlite'),
        synchronize: false,
        logging: true,
        ...(options as any),
      },
      injector,
      defaultConfig: {
        types: {
          ...DEFAULT_ORM_CONFIG.types,
          // todo 临时
          checkbox: { type: Number },
        },
      },
    },
  );

  return result;
}
export async function createDefineInjector(injector: Injector) {
  const result = createDefine(injector);
  await result.dataSource.initialize();
  const childParent = createInjector({
    providers: [
      { provide: DATA_SOURCE, useValue: result.dataSource },
      { provide: EntitySchemaObjectToken, useValue: result.object },
      LimitService,
      AccountService,
      VersionService,
      DataSourceService,
      VersionAssetService,
      RoleService,
      RoleGroupService,
    ],
    parent: injector,
  });
  return childParent;
}

export type EntitySchemaObject = ReturnType<typeof createDefine>['object'];

export type InferEntity<T> = T extends EntitySchema<infer A> ? A : never;
export const EntitySchemaObjectToken = new InjectionToken<EntitySchemaObject>(
  '',
);
