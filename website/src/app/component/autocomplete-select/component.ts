import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SelectOption } from '../select/type';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'autocomplete-select',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatTooltipModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteSelectFCC),
      multi: true,
    },
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteSelectFCC extends BaseControl {
  /** ---输入--- */
  /** @title 允许非列表的值输入
  @default false */
  allowCustom = input<boolean>(false);
  /** @title 列表
  @default [] */
  options = input<SelectOption[]>([]);
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
  /** @title 最大显示数量
  @default 20 */
  maxCount = input<number>(20);
  /** ---输出--- */

  searchOptions$$ = computed(() => {
    let content = this.searchContent$();
    if (!content) {
      return this.options().slice(0, this.maxCount());
    } else if (this.searchBy()) {
      content = this.searchBy()!(content);
    }

    const filterWith = this.filterWith();
    let count = 0;
    const list = [];
    for (const item of this.options()) {
      const result = filterWith ? filterWith(content, item) : true;
      if (result) {
        count++;
        list.push(item);
        if (count === this.maxCount()) {
          break;
        }
      }
    }
    return list;
  });

  searchContent$ = linkedSignal(() => this.value$() || '');

  searchChange(option: SelectOption) {
    this.valueChange(option.value);
  }
  blurChange() {
    if (
      this.allowCustom() ||
      (this.value$() !== this.searchContent$() &&
        this.options().find(({ value }) => value === this.searchContent$()))
    ) {
      this.valueChange(this.searchContent$());
    }
  }
}
