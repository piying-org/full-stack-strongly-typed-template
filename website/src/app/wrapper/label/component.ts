import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'wrapper-label',
  templateUrl: './component.html',
  standalone: true,
  imports: [MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelWrapper extends PiyingViewWrapperBase {}
