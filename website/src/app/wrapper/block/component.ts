import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiyingViewWrapperBase } from '@piying/view-angular';
@Component({
  selector: 'block-wrapper',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './component.scss',
})
export class BlockWrapper extends PiyingViewWrapperBase {}
