import * as v from 'valibot';
import { SelectOption } from '../select/type';
export const filterWith = v.pipe(
  v.optional(
    v.custom<(input: string, option: SelectOption) => boolean>(Boolean),
    (input: string, option: SelectOption) =>
      option.label?.includes(input) ||
      (typeof option.value === 'string' &&
        option.value.toLocaleLowerCase().includes(input)) ||
      (typeof option.description === 'string' &&
        option.description.toLocaleLowerCase().includes(input)),
  ),
  v.title('过滤'),
  v.metadata({
    declaration: `(input: string, option: SelectOption) => boolean`,
  }),
);

export const searchBy = v.pipe(
  v.optional(v.custom<(input: string) => string>(Boolean), (input: string) =>
    input.toLocaleLowerCase(),
  ),
  v.title('搜索'),
  v.description('搜索文本处理'),
  v.metadata({
    declaration: `(input: string) => string`,
  }),
);

export const maxCount = v.pipe(
  v.optional(v.number(), 20),
  v.title('最大显示数量'),
);
export const optionsDefine = v.pipe(
  v.optional(v.custom<SelectOption[]>(Boolean), []),
  v.title('列表'),
  v.metadata({
    declaration: `SelectOption[]`,
  }),
);
