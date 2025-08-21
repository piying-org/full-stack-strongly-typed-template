import { Component, forwardRef, inject, viewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { BaseControl, PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({
  selector: 'app-date-picker',
  templateUrl: './component.html',
  imports: [MatDatepickerModule, FormsModule],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent extends BaseControl {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  suffixTemplate = viewChild('suffix', {});
  dateChanged(value: any, index: number) {
    this.value$.update((list) => {
      list ??= [];
      list[index] = value;
      return list;
    });
    if (index === 1) {
      this.valueChange(this.value$());
    }
  }
  ngAfterViewInit(): void {
    this.field$$().props.update((props) => {
      return { ...props, iconSuffix: this.suffixTemplate() };
    });
  }
}
