import { createRootInjector } from 'static-injector';
import { createDefine } from './create-define';
import { SALT } from './const/global';
import * as bcrypt from 'bcryptjs';

export async function init() {
  const injector = createRootInjector({ providers: [] });
  const result = createDefine(injector, { synchronize: true, logging: true });
  await result.dataSource.initialize();

  const accountRepo = result.dataSource.getRepository(result.object.Account);
  const roleRepo = result.dataSource.getRepository(result.object.Role);

  let baseRoleList = [
    ...['version'].flatMap((item) =>
      ['find', 'save', 'remove'].map((method) => `${item}.${method}`),
    ),
  ].map((item) =>
    roleRepo.create({
      id: item,
      name: item,
      description: 'api权限',
      isDefault: 0,
      type: 1,
    }),
  );
  baseRoleList = await roleRepo.save(baseRoleList);
  const roleGroupRepo = result.dataSource.getRepository(
    result.object.RoleGroup,
  );
  const roleGroupEntity = await roleGroupRepo.save(
    roleGroupRepo.create({
      name: '基础',
      description: '最基础的一些权限',
      type: 1,
      children: baseRoleList,
    }),
  );
  await accountRepo.save(
    accountRepo.create({
      username: 'root',
      password: bcrypt.hashSync('1234567890', SALT),
      email: 'root@root.com',
      isSuper: 1,
      roleGroupList: [roleGroupEntity],
    }),
  );
  await result.dataSource.destroy();
}
init();
