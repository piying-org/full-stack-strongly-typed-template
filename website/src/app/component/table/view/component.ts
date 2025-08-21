import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, resource } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PiyingView } from '@piying/view-angular';
import { DefaultViewConfig } from '../../../schema/default-config';
import { CustomNgBuilder } from '../../../schema/custom.builder';
@Component({
  templateUrl: './component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    PiyingView,
  ],
})
export class SchemaDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  options = {
    context: this.data.context,
    fieldGlobalConfig: DefaultViewConfig,
    builder: CustomNgBuilder,
  };
  data$ = this.data.getData
    ? resource({ loader: () => this.data.getData(this.data.data) }).value
    : signal(this.data.data);
  model$ = signal({});
  ref = inject(MatDialogRef);
  loading$ = signal(false);
  constructor() {}

  ngOnInit(): void {}
  apply() {
    this.loading$.set(true);
    (this.data.save(this.model$()) as Promise<any>)
      .then(() => {
        this.ref.close(true);
      })
      .finally(() => {
        this.loading$.set(false);
      });
  }
}
