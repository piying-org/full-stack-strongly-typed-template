import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PiyingView } from '@piying/view-angular';
import { DefaultViewConfig } from '../schema/default-config';
import { CustomNgBuilder } from '../schema/custom.builder';
@Component({
  selector: 'app-schema-view',
  templateUrl: './component.html',
  standalone: true,
  imports: [PiyingView],
})
export class SchemaViewRC {
  route = inject(ActivatedRoute);
  context = this.route.snapshot.data['context']();
  schema = this.route.snapshot.data['schema'];
  options = {
    context: this.context,
    fieldGlobalConfig: DefaultViewConfig,
    builder: CustomNgBuilder,
  };
}
