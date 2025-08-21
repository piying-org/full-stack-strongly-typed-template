import { router, SuperProcedure } from '@@router';
import { inject } from 'static-injector';
import * as v from 'valibot';
import { DATA_SOURCE } from '../../token';
import { EntitySchemaObjectToken } from '../../create-define';
import { DataSourceService } from '../../service/data-source.service';
import { VersionAsset_Save } from '@project/define';
export class VersionAssetService {
  #entitySchema = inject(EntitySchemaObjectToken);
  versionRepo = inject(DATA_SOURCE).getRepository(this.#entitySchema.Version);
  versionAssetRepo = inject(DATA_SOURCE).getRepository(
    this.#entitySchema.VersionAsset,
  );
  #dsService = inject(DataSourceService);

  router = router({
    find: SuperProcedure.input(
      v.custom<{ take: number; skip: number; versionId: string }>(Boolean),
    ).mutation(async ({ input, ctx }) => {
      const result = await this.versionAssetRepo.findAndCount({
        take: input.take,
        skip: input.skip,
        where: {
          versionId: input.versionId,
        },
      });
      return {
        list: result[0],
        count: result[1],
      };
    }),

    remove: SuperProcedure.input(v.string()).mutation(
      async ({ input, ctx }) => {
        return this.versionAssetRepo.remove(
          this.versionAssetRepo.create({ id: input }),
        );
      },
    ),
    save: SuperProcedure.input(VersionAsset_Save).mutation(
      async ({ input, ctx }) => {
        return this.versionAssetRepo.save(input);
      },
    ),
  });
}
