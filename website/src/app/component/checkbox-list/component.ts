import { Component, forwardRef, input, linkedSignal } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BaseControl } from '@piying/view-angular';
import { deepEqual } from 'fast-equals';
@Component({
  selector: 'app-checkbox',
  templateUrl: './component.html',
  imports: [MatCheckboxModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxListFCC),
      multi: true,
    },
  ],
})
export class CheckboxListFCC extends BaseControl {
  options = input.required<{ label: string; value: any }[]>();
  selectedList = linkedSignal(() => {
    const inputSelected = this.value$();
    if (!inputSelected) {
      return [];
    }
    return this.options().map((item) => {
      return inputSelected.some((inputItem: any) =>
        deepEqual(item.value, inputItem),
      );
    });
  });

  ngOnInit(): void {}
  selectedChange(event: any, index: number) {
    this.selectedList.update((list) => {
      list = [...list];
      list[index] = event;
      return list;
    });
    this.valueChange(
      this.options()
        .filter((id, index) => this.selectedList()[index])
        .map((item) => item.value),
    );
  }
}
