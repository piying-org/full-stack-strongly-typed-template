import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TableItemComponent } from './item/component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { SchemaDialogComponent } from './view/component';
import { computedWithPrev } from '../../util/computed-with-prev';
import { BaseSchema } from 'valibot';
import { CurdType } from '../../../../../define/type';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

export type ContentType = {
  type?: 'string' | 'date' | 'number' | 'enum';
  value?: any;
  // key?: string;
  format?: string;
  enum: any;
};

export interface DefineColumn {
  header: string;
  key?: string;
  content?: ((item: any) => ContentType) | ContentType;
  sortable?: boolean;
}
export interface PageInfo {
  take: number;
  skip: number;
}
export type RequestFn = (options: { take: number; skip: number }) => Promise<{
  count: number;
  list: any[];
}>;
export type SchemaAction = {
  type: 'schema';
  icon: string;
  description?: string;
  schema: any;
  context: any;
};
export type SchemaItemAction = {
  type: 'schemaItem';
  icon: string;
  description?: string;
  schema: any;
  save: (data: any) => Promise<any>;
  getData: (data: any) => Promise<any>;
  context?: (data: any, context: any) => any;
};
export type DeleteAction = {
  type: 'delete';
  icon: string;
  description?: string;
};
export type EditAction = {
  type: 'edit';
  schema: any;
  icon: string;
  description?: string;
};
export type CallbackAction = {
  type: 'callback';
  fn: (data: any) => Promise<any>;
  icon: string;
  description?: string;
};
export type Action =
  | EditAction
  | DeleteAction
  | CallbackAction
  | SchemaItemAction
  | SchemaAction;
type TableGate = { addItem: boolean };
const DefaultTableGate: TableGate = { addItem: true };
@Component({
  selector: 'app-table',
  templateUrl: './component.html',
  styleUrl: './component.scss',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    PurePipe,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
})
export class TableComponent {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  defineColumn = input.required<DefineColumn[]>();
  createSchema = input<BaseSchema<any, any, any>>();
  showColumns = input<string[]>();
  pageSize = input<number>(10);
  pageSizeOptions = input<number[]>([10, 20, 50, 100]);
  service = input.required<CurdType>();
  action = input<Action[]>();
  gate = input<Partial<TableGate>>();
  searchParams = input<Record<string, any>>();
  gate$$ = computed(() => {
    return { ...DefaultTableGate, ...this.gate() };
  });
  pageInfo$ = linkedSignal<PageInfo>(
    computed(() => {
      return {
        take: this.pageSize(),
        skip: 0,
      };
    }),
  );
  pageIndex$ = signal(0);
  updateIndex$ = signal(0);
  sortOptions$ = signal<{ order?: Record<string, string> }>({});
  result$$ = resource({
    defaultValue: { list: [], count: 0 },
    params: () => {
      this.updateIndex$();
      return {
        ...this.pageInfo$(),
        ...this.sortOptions$(),
        ...this.searchParams(),
      };
    },
    loader: (param) => {
      return this.service().find!(param.params);
    },
  });
  data$$ = computedWithPrev<any[]>((prev) => {
    const isLoading = this.result$$.isLoading();
    return isLoading ? (prev ?? []) : this.result$$.value().list;
  });
  count$$ = computedWithPrev<number>((prev) => {
    const isLoading = this.result$$.isLoading();
    return isLoading ? (prev ?? 0) : this.result$$.value().count;
  });

  matDialog = inject(MatDialog);
  displayedColumns = (define: DefineColumn[], showColumns?: string[]) => {
    const list = showColumns
      ? showColumns
      : define.map((item, index) => item.key ?? `__${index}`);
    return this.action()?.length ? [...list, '__ACTION'] : list;
  };

  contentData = (row: any, itemDefine: DefineColumn): Required<ContentType> => {
    const contentType = (
      typeof itemDefine.content === 'function'
        ? itemDefine.content(row)
        : (itemDefine.content ?? {})
    ) as ContentType;
    contentType.type ??= 'string';
    if (itemDefine.key) {
      return { ...contentType, value: row.data[itemDefine.key] } as any;
    }
    return contentType as any;
  };
  pageChange($event: PageEvent) {
    this.pageInfo$.set({
      take: $event.pageSize,
      skip: $event.pageIndex * $event.pageSize,
    });
  }
  add() {
    const ref = this.matDialog.open(TableItemComponent, {
      data: {
        type: 'new',
        schema: this.createSchema(),
        save: (item: any) => {
          return this.service().save!(item);
        },
      },
      width: '800px',
    });
    ref
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe((item) => {
        this.updateIndex$.update((a) => a + 1);
      });
  }

  async actionChange(item: Action, data: any) {
    if (item.type === 'edit') {
      const ref = this.matDialog.open(TableItemComponent, {
        data: {
          data,
          type: 'change',
          schema: item.schema,
          save: (item: any) => {
            return this.service().save!(item);
          },
        },
        width: '800px',
      });
      ref
        .afterClosed()
        .pipe(filter(Boolean))
        .subscribe((item) => {
          this.updateIndex$.update((a) => a + 1);
        });
    } else if (item.type === 'callback') {
      item.fn(data);
    } else if (item.type === 'delete') {
      await this.service().remove!(data);
      this.updateIndex$.update((a) => a + 1);
    } else if (item.type === 'schemaItem') {
      const ref = this.matDialog.open(TableItemComponent, {
        data: {
          data,
          type: 'change',
          schema: item.schema,
          save: item.save,
          getData: item.getData,
          context: item.context
            ? item.context(data, this.field$$().context)
            : this.field$$().context,
        },
        width: '800px',
      });
      ref
        .afterClosed()
        .pipe(filter(Boolean))
        .subscribe((item) => {
          this.updateIndex$.update((a) => a + 1);
        });
    } else if (item.type === 'schema') {
      const ref = this.matDialog.open(SchemaDialogComponent, {
        data: {
          data,
          schema: item.schema,
          context: item.context(data),
        },
        width: '1000px',
      });
    }
  }
  sortChange(input: Sort) {
    this.sortOptions$.update((value) => {
      if (!input.direction) {
        value = { ...value };
        delete value.order?.[input.active];
      } else {
        value = { order: { ...value.order, [input.active]: input.direction } };
      }
      return value;
    });
  }
}
