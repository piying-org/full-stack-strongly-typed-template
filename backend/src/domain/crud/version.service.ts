import { router, SuperProcedure } from '@@router';
import { inject } from 'static-injector';
import * as v from 'valibot';
import { DATA_SOURCE } from '../../token';
import { Version_Save } from '@project/define';
import { EntitySchemaObjectToken } from '../../create-define';
import { DataSourceService } from '../../service/data-source.service';
import { CustomFindOptions, parseDefine } from '@@domain/search/type';
export class VersionService {
  #entitySchema = inject(EntitySchemaObjectToken);
  versionRepo = inject(DATA_SOURCE).getRepository(this.#entitySchema.Version);
  versionAssetRepo = inject(DATA_SOURCE).getRepository(
    this.#entitySchema.VersionAsset,
  );
  #dsService = inject(DataSourceService);

  router = router({
    find: SuperProcedure.input(
      v.custom<CustomFindOptions<'Version'>>(Boolean),
    ).mutation(async ({ input, ctx }) => {
      const where = input.where ? parseDefine(input.where) : undefined;
      const result = await this.versionRepo.findAndCount({
        ...input,
        where: where,
      });
      return {
        list: result[0],
        count: result[1],
      };
    }),
    findOne: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        return this.versionRepo.findOne({ where: { id: input } });
      },
    ),
    save: SuperProcedure.input(Version_Save).mutation(
      async ({ input, ctx }) => {
        return this.versionRepo.save(input);
      },
    ),
    remove: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        return this.versionRepo.remove(this.versionRepo.create({ id: input }));
      },
    ),
  });
}
