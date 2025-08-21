import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'wrapper-card',
  templateUrl: './component.html',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrapperCard extends PiyingViewWrapperBase {}
