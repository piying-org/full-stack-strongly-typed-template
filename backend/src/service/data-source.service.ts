import { Injectable, inject } from 'static-injector';
import type {
  EntityManager,
  EntitySchema,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import type { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';
import { DATA_SOURCE } from '../token';
export type InputTuple<T> = {
  [K in keyof T]: T[K];
};
export type RepoMap<T> = {
  [K in keyof T]: Repository<
    T[K] extends EntitySchema<infer A>
      ? A extends ObjectLiteral
        ? A
        : Record<string, any>
      : Record<string, any>
  >;
};

@Injectable()
export class DataSourceService {
  dataSource = inject(DATA_SOURCE);
  transaction<A extends readonly unknown[], R>(
    isolationLevel: IsolationLevel,
    entityList: readonly [...InputTuple<A>],
    fn: (entityManager: EntityManager, list: RepoMap<A>) => Promise<R>,
  ): Promise<R>;
  transaction<A extends readonly unknown[], R>(
    entityList: readonly [...InputTuple<A>],
    fn: (entityManager: EntityManager, list: RepoMap<A>) => Promise<R>,
  ): Promise<R>;
  transaction(...args: any[]) {
    let isolationLevel: IsolationLevel | undefined;
    if (args.length === 3) {
      isolationLevel = args.shift();
    }
    const [entityList, fn] = args;
    return this.dataSource.transaction(
      isolationLevel || 'READ COMMITTED',
      (entityManager) =>
        fn(
          entityManager,
          (entityList as any[]).map((item) =>
            entityManager.getRepository(item as any),
          ),
        ),
    );
  }
}
