import { signal } from '@angular/core';
import { DefaultValueAccessor } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { PiComponentDefaultConfig } from '@piying/view-angular';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { WrapperCard } from '../wrapper/card/component';
import { NumberValueAccessor } from '@angular/forms';
import { CheckboxFCC, LabelFCC, SelectFCC } from '../component';
import { ButtonNFCC } from '../component/button/button.component';
import { FormFiledContentDirective } from '../directive';
export const InputConfig: PiComponentDefaultConfig = {
  type: 'input',
  wrappers: ['form-field'],
  directives: [
    { type: MatInput, selector: 'matInput' },
    { type: DefaultValueAccessor, selector: 'formControl' },
  ],
};
export const TextareaConfig: PiComponentDefaultConfig = {
  type: 'textarea',
  wrappers: ['form-field'],
  directives: [
    { type: MatInput, selector: 'matInput' },
    { type: DefaultValueAccessor, selector: 'formControl' },
    {
      type: CdkTextareaAutosize,
      selector: 'cdkTextareaAutosize',
      inputs: signal({ cdkTextareaAutosize: true }),
    },
  ],
};
export const NumberConfig: PiComponentDefaultConfig = {
  type: 'input',
  attributes: {
    type: 'number',
  },
  wrappers: ['form-field'],
  directives: [
    {
      type: MatInput,
      selector: 'matInput',
    },
    { type: NumberValueAccessor, selector: 'formControl' },
  ],
};
export const CheckboxConfig: PiComponentDefaultConfig = {
  type: CheckboxFCC,
};

export const IconButtonConfig: PiComponentDefaultConfig = {
  type: { component: MatIconButton, module: MatButtonModule },
  selector: 'button',
  attributes: { 'mat-icon-button': '' },
};
// button
export const ButtonConfig: PiComponentDefaultConfig = {
  type: ButtonNFCC,
};

//select
export const SelectConfig: PiComponentDefaultConfig = {
  type: SelectFCC,
  directives: [
    {
      type: FormFiledContentDirective,
      inputs: signal({
        focusSelector: '.mat-mdc-select-trigger',
        focusAction: 'click',
        controlType: 'mat-select',
      }),
    },
  ],
  wrappers: ['form-field'],
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
