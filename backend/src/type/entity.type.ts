import * as v from 'valibot';

export const IDDefine = v.string();
export type ID = v.InferOutput<typeof IDDefine>;
