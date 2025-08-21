import { router, SuperProcedure } from '@@router';
import { inject } from 'static-injector';
import * as v from 'valibot';
import { DATA_SOURCE } from '../../token';
import { EntitySchemaObjectToken } from '../../create-define';
import { Role_Save, SetRoleGroupChildren_Save } from '@project/define';
import { CustomFindOptions } from '@@domain/search/type';
import { In } from 'typeorm';
export class RoleGroupService {
  #entitySchema = inject(EntitySchemaObjectToken);
  #repo = inject(DATA_SOURCE).getRepository(this.#entitySchema.RoleGroup);
  #roleRepo = inject(DATA_SOURCE).getRepository(this.#entitySchema.Role);

  router = router({
    find: SuperProcedure.input(
      v.custom<CustomFindOptions<'RoleGroup'>>(Boolean),
    ).mutation(async ({ input, ctx }) => {
      const result = await this.#repo.findAndCount({
        take: input.take,
        skip: input.skip,
      });
      return {
        list: result[0],
        count: result[1],
      };
    }),

    remove: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        return this.#repo.remove(this.#repo.create({ id: input }));
      },
    ),
    save: SuperProcedure.input(Role_Save).mutation(async ({ input, ctx }) => {
      return this.#repo.save(input);
    }),
    setRole: SuperProcedure.input(SetRoleGroupChildren_Save).mutation(
      async ({ input, ctx }) => {
        const childrenList = await this.#roleRepo.find({
          where: { id: In(input.children) },
        });
        return this.#repo.save({ id: input.id, children: childrenList });
      },
    ),
    getRole: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        const result = await this.#repo.findOne({
          where: { id: input },
          relations: { children: true },
        });
        return result!.children;
      },
    ),
  });
}
