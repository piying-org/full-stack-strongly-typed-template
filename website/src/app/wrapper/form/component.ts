import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { PiyingViewWrapperBase } from '@piying/view-angular';
@Component({
  selector: 'form-wrapper',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './component.scss',
})
export class FormWrapper extends PiyingViewWrapperBase {
  submited = output<any>();
}
