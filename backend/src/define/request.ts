import * as v from 'valibot';
export const FindOptions = v.object({
  take: v.number(),
  skip: v.optional(v.number(), 0),
});

// export function createWhere<T extends v.ObjectSchema<any, any> | v.IntersectSchema<any, any>>(
//   schema: T
// ): { [X in keyof v.InferInput<T>]: string } {
//   return;
// }
