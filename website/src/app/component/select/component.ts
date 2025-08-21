import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { AsyncPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { SelectOption } from './type';
import { BaseControl } from '@piying/view-angular';
import {
  DefaultOptionConvert,
  OptionConvert,
  transformOptions,
} from '../util/options';

@Component({
  selector: 'cyia-select',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  standalone: true,
  imports: [
    MatSelectModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    FormsModule,
    MatTooltipModule,
    PurePipe,
    AsyncPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFCC),
      multi: true,
    },
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFCC extends BaseControl {
  /** ---输入--- */
  /** @title 列表
  @default [] */
  options = input<SelectOption[]>([]);
  optionConvert = input<OptionConvert, Partial<OptionConvert>>(
    DefaultOptionConvert,
    {
      transform: (input) => ({ ...DefaultOptionConvert, ...input }),
    },
  );
  resolvedOptions$$ = computed(() =>
    transformOptions(this.options(), this.optionConvert()),
  );

  /** @title 过滤
  @default (input,option)=>option.label?.includes(input)||typeof option.value==="string"&&option.value.toLocaleLowerCase().includes(input)||typeof option.description==="string"&&option.description.toLocaleLowerCase().includes(input) */
  filterWith = input<(input: string, option: SelectOption) => boolean>(
    (input, option) =>
      option.label?.includes(input) ||
      (typeof option.value === 'string' &&
        option.value.toLocaleLowerCase().includes(input)) ||
      (typeof option.description === 'string' &&
        option.description.toLocaleLowerCase().includes(input)),
  );
  /** @title 搜索
  @description 搜索文本处理
  @default input=>input.toLocaleLowerCase() */
  searchBy = input<(input: string) => string>((input) =>
    input.toLocaleLowerCase(),
  );
  /** @title 启用搜索 */
  enableSearch = input<boolean>();
  /** @title 搜索占位符
  @default '搜索内容' */
  searchPlaceholder = input<string>('搜索内容');
  /** @title 最大显示数量
  @default 20 */
  maxCount = input<number>(20);
  /** @title 显示标签
  @default 'local' */
  mode = input<'local' | 'remote'>('local');
  /** @title 显示标签 */
  remoteFilter = input<(value: string) => Promise<SelectOption[]>>();
  /** @title 比较选项
  @default (o1,o2)=>o1===o2 */
  compareWith = input<(o1: any, o2: any) => boolean>((o1, o2) => o1 === o2);

  /** ---输出--- */
  /** 本地搜索过滤 */
  searchOptions$$ = computed(() => {
    let content = this.searchContent$();
    if (!content) {
      return this.resolvedOptions$$().slice(0, this.maxCount());
    } else if (this.searchBy()) {
      content = this.searchBy()!(content);
    }

    const filterWith = this.filterWith();
    let count = 0;

    const filterList = [];
    for (const option of this.resolvedOptions$$()) {
      if (count === this.maxCount()) {
        break;
      }
      const result = filterWith ? filterWith(content, option) : true;
      if (result) {
        count++;
        filterList.push(option);
      }
    }
    return filterList;
  });

  searchContent$ = signal('');

  // 可用搜索字典排序
}
