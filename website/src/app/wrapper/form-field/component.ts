import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';

import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';
import { summarize } from 'valibot';
import { MatFormControlBindDirective } from './mat-bind.directive';
@Component({
  selector: 'mat-form-field-wrapper',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [
    MatFormFieldModule,
    CommonModule,
    InsertFieldDirective,
    MatFormControlBindDirective,
  ],
  styleUrls: ['./component.scss'],
})
export class MatFormFieldWrapper {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  formField = viewChild('formField', { read: MatFormField });

  ngOnInit(): void {}
  showError$$ = computed(() => {
    return (
      this.field$$().form.control?.errors &&
      (this.field$$().form.control?.dirty ||
        this.field$$().form.control?.touched)
    );
  });
  errorStr$$ = computed(() => {
    const field = this.field$$();
    const valibot = field.form.control!.errors!['valibot'];
    if (valibot) {
      return summarize(valibot);
    } else {
      return Object.values(field.form.control!.errors!)
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join('\n');
    }
  });
}
