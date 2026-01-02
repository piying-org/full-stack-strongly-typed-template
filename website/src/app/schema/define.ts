import { signal } from '@angular/core';
import { DefaultValueAccessor } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { actions } from '@piying/view-angular';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { WrapperCard } from '../wrapper/card/component';
import { NumberValueAccessor } from '@angular/forms';
import { CheckboxFCC, LabelFCC, SelectFCC } from '../component';
import { ButtonNFCC } from '../component/button/button.component';
import { FormFiledContentDirective } from '../directive';
import { PiViewConfig } from '@piying/view-angular';
import { InputFCC } from '../component/input';
import { TextareaFCC } from '../component/textarea';
import { InputNumberFCC } from '../component/input-number';
type PiComponentDefaultConfig = NonNullable<PiViewConfig['types']>[string];
export const InputConfig: NonNullable<PiViewConfig['types']>[string] = {
  type: InputFCC,
  actions: [
    actions.wrappers.set(['form-field']),
    actions.directives.set([{ type: MatInput }]),
  ],
};
export const TextareaConfig: PiComponentDefaultConfig = {
  type: TextareaFCC,
  actions: [
    actions.wrappers.set(['form-field']),
    actions.directives.set([
      { type: MatInput },
      {
        type: CdkTextareaAutosize,
        inputs: { cdkTextareaAutosize: true },
      },
    ]),
  ],
};
export const NumberConfig: PiComponentDefaultConfig = {
  type: InputNumberFCC,
  actions: [
    actions.attributes.set({
      type: 'number',
    }),
    actions.wrappers.set(['form-field']),
    actions.directives.set([
      {
        type: MatInput,
      },
      { type: NumberValueAccessor },
    ]),
  ],
};
export const CheckboxConfig: PiComponentDefaultConfig = {
  type: CheckboxFCC,
};

export const IconButtonConfig: PiComponentDefaultConfig = {
  type: { component: MatIconButton, module: MatButtonModule },
  actions: [actions.attributes.set({ 'mat-icon-button': '' })],
};
// button
export const ButtonConfig: PiComponentDefaultConfig = {
  type: ButtonNFCC,
};

//select
export const SelectConfig: PiComponentDefaultConfig = {
  type: SelectFCC,
  actions: [
    actions.directives.set([
      {
        type: FormFiledContentDirective,
        inputs: {
          focusSelector: '.mat-mdc-select-trigger',
          focusAction: 'click',
          controlType: 'mat-select',
        },
      },
    ]),
    actions.wrappers.set(['form-field']),
  ],
};

//label
export const LabelConfig: PiComponentDefaultConfig = {
  type: LabelFCC,
};

// 无key组件

// wrapper

//card
export const WrapperCardConfig = {
  type: WrapperCard,
};
