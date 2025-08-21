import { router, SuperProcedure } from '@@router';
import { inject } from 'static-injector';
import * as v from 'valibot';
import { DATA_SOURCE } from '../../token';
import { EntitySchemaObjectToken } from '../../create-define';
import { Role_Save } from '@project/define';
import { CustomFindOptions } from '@@domain/search/type';
export class RoleService {
  #entitySchema = inject(EntitySchemaObjectToken);
  #repo = inject(DATA_SOURCE).getRepository(this.#entitySchema.Role);

  router = router({
    find: SuperProcedure.input(
      v.custom<CustomFindOptions<'Role'>>(Boolean),
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
  });
}
