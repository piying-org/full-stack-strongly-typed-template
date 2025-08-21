import { column, columnPrimaryKey } from '@piying/orm/core';
import * as v from 'valibot';

export const BaseSchema = v.object({
  id: v.pipe(v.string(), columnPrimaryKey({ generated: 'uuid' })),
  createdAt: v.pipe(v.date(), column({ createDate: true })),
  updateAt: v.pipe(v.date(), column({ updateDate: true })),
});
export const StrColumn = v.pipe(v.string(), column());
