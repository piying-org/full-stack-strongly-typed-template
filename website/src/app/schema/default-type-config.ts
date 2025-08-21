import { PiViewConfig, PiyingViewGroup } from '@piying/view-angular';

import {
  InputConfig,
  NumberConfig,
  CheckboxConfig,
  TextareaConfig,
  ButtonConfig,
  LabelConfig,
  SelectConfig,
} from './define';
import { LabelGroupFGC } from '../group/label-group/component';
import { signal } from '@angular/core';
import { CheckboxListFCC } from '../component/checkbox-list/component';
import { FormFiledContentDirective } from '../directive';
import { DatePickerComponent } from '../component';
const ArrayRepeatConfig = {
  type: () =>
    import('../array/array/array-repeat.component').then(
      ({ ArrayRepeatFAC }) => ArrayRepeatFAC,
    ),
};
export const DefaultViewTypes = {
  'span-input': InputConfig,
  string: InputConfig,
  input: InputConfig,
  number: NumberConfig,
  boolean: CheckboxConfig,
  checkbox: CheckboxConfig,
  textarea: TextareaConfig,
  button: ButtonConfig,
  label: LabelConfig,
  'array-repeat': ArrayRepeatConfig,
  select: SelectConfig,
  picklist: SelectConfig,
  array: ArrayRepeatConfig,
  checkboxList: { type: CheckboxListFCC },
  tuple: { type: PiyingViewGroup },
  object: {
    type: PiyingViewGroup,
  },
  intersect: {
    type: PiyingViewGroup,
  },
  'intersect-group': {
    type: PiyingViewGroup,
  },
  'remote-search-group': {
    type: () =>
      import('../group/remote-search-group/component').then(
        ({ RemoteSearchGroupFGC }) => RemoteSearchGroupFGC,
      ),
  },

  table: {
    type: () =>
      import('../component/table/component').then(
        ({ TableComponent }) => TableComponent,
      ),
  },
  // 'icon-button': IconButtonConfig,
  /** group */
  'label-group': {
    type: LabelGroupFGC,
  },
  dateRange: {
    type: DatePickerComponent,
    directives: [
      {
        type: FormFiledContentDirective,
        inputs: signal({ focusSelector: 'input' }),
      },
    ],
    wrappers: ['form-field'],
  },
} as PiViewConfig['types'];
