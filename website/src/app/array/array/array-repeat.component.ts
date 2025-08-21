import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'formly-repeat-section',
  templateUrl: './array-repeat.component.html',
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgTemplateOutlet],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./component.scss'],
})
export class ArrayRepeatFAC extends PiyingViewGroupBase {
  defaultLength = input<number>();
  initPrefix = input<(index: number | undefined) => any>();
  label = input<string>();
  minLength = input<number>();

  ngOnInit(): void {
    const addLength = Math.max(
      0,
      (this.defaultLength() || 0) -
        (this.field$$().form.control!.value || []).length,
    );

    for (let i = 0; i < addLength; i++) {
      this.field$$().action.set(this.initPrefix()?.(i), i);
    }
  }
  remove(index: number) {
    this.field$$().action.remove(index);
  }
  add() {
    this.field$$().action.set(this.initPrefix()?.(undefined));
  }
}
