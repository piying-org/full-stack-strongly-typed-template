import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'cyia-checkbox',
  templateUrl: 'component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxFCC),
      multi: true,
    },
  ],
  standalone: true,
  imports: [FormsModule, MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFCC extends BaseControl {
  /** ---输入--- */
  /** @title 标签 */
  label = input<string>();
  labelMap = input<(value: boolean) => string>();
  /** @title 颜色
  @default 'primary' */
  color = input<string>('primary');
  /** @title 不确定
  @description 启用后除了选中,未选中,还有不确定显示
  @default false */
  indeterminate = input<boolean>(false);
  /** ---输出--- */
}
