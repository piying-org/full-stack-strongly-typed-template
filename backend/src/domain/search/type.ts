import {
  And,
  Between,
  Equal,
  FindManyOptions,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Or,
} from 'typeorm';
import { EntitySchemaObject, InferEntity } from '../../create-define';
// 词条用的
export type AndOp = { operator: 'and'; value: Operator[] };
export type OrOp = { operator: 'or'; value: Operator[] };
export type LessThanOp = { operator: 'lt'; value: any };
export type LessThanOrEqualOp = { operator: 'lte'; value: any };
export type GreaterThanOp = { operator: 'gt'; value: any };
export type GreaterThanOrEqualOp = { operator: 'gte'; value: any };
export type LikeOp = { operator: 'like'; value: any };
export type ILikeOp = { operator: 'ilike'; value: any };
export type NotOp = { operator: 'not'; value: Operator };
export type EqualOp = { operator: 'equal'; value: any };
export type BetweenOp = { operator: 'between'; value: [any, any] };
export type InOp = { operator: 'in'; value: any[] };
export type IsNullOp = { operator: 'isNull' };
export type RelationOp = { operator: 'relation'; value: QueryCondition<any> };

export type Operator =
  | AndOp
  | OrOp
  | LessThanOp
  | LessThanOrEqualOp
  | GreaterThanOp
  | GreaterThanOrEqualOp
  | LikeOp
  | ILikeOp
  | NotOp
  | EqualOp
  | BetweenOp
  | InOp
  | IsNullOp
  | RelationOp;

function parseOperator(
  input: Exclude<Operator, RelationOp>,
): FindOperator<any> {
  switch (input.operator) {
    case 'and': {
      return And(
        ...input.value.map((item) =>
          parseOperator(item as Exclude<Operator, RelationOp>),
        ),
      );
    }
    case 'or': {
      return Or(
        ...input.value.map((item) =>
          parseOperator(item as Exclude<Operator, RelationOp>),
        ),
      );
    }
    case 'lt': {
      return LessThan(input.value);
    }
    case 'lte': {
      return LessThanOrEqual(input.value);
    }
    case 'gt': {
      return MoreThan(input.value);
    }
    case 'gte': {
      return MoreThanOrEqual(input.value);
    }
    case 'like': {
      return Like(input.value);
    }
    case 'ilike': {
      return ILike(input.value);
    }
    case 'not': {
      return Not(input.value);
    }
    case 'equal': {
      return Equal(input.value);
    }
    case 'between': {
      return Between(input.value[0], input.value[1]);
    }
    case 'in': {
      return In(input.value);
    }
    case 'isNull': {
      return IsNull();
    }
  }
}
export type ConditionAnd<T extends Record<string, any>> = Record<
  keyof T,
  Operator
>;
export type ConditionOr<T extends Record<string, any>> = Record<
  keyof T,
  Operator
>[];
export type QueryCondition<T extends Record<string, any>> =
  | ConditionAnd<T>
  | ConditionOr<T>;
export function parseDefine<T extends Record<string, any>>(
  input: QueryCondition<T>,
): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
  const list = Array.isArray(input) ? input : [input];
  return list.map((conditionItem) => {
    const obj = {} as any;
    for (const key in conditionItem) {
      const item = conditionItem[key];
      if (item.operator === 'relation') {
        obj[key] = parseDefine(item.value);
      } else {
        obj[key] = parseOperator(item);
      }
    }
    return obj;
  });
}
export type CustomFindOptions<T extends keyof EntitySchemaObject> = Omit<
  FindManyOptions<InferEntity<EntitySchemaObject[T]>>,
  'where'
> & { where?: QueryCondition<InferEntity<EntitySchemaObject[T]>> };
