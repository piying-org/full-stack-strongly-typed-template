import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'cyia-button',
  templateUrl: './button.component.html',
  providers: [],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonNFCC {
  type = input<
    'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab' | undefined
  >(undefined);
  buttonType = input('button');
  color = input('primary');
  label = input<string>();
  disabled = input<boolean>();
  fontSet = input<string>();
  icon = input<string>();
  clicked = input.required<() => Promise<any>>();
  // todo 改为wrapper
  description = input<string>();
  type$$ = computed(() => {
    const type = this.type();
    if (!type && this.icon()) {
      return 'icon';
    }
    return type;
  });

  loading$ = signal(false);
  #field = inject(PI_VIEW_FIELD_TOKEN, { optional: true });
  async onClicked() {
    this.loading$.set(true);
    try {
      await this.clicked()();
    } catch (error) {
    } finally {
      this.loading$.set(false);
    }
  }
}
