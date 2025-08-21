import { BlockWrapper } from '../wrapper/block/component';
import { MatFormFieldWrapper } from '../wrapper/form-field/component';
import { FormWrapper } from '../wrapper/form/component';
import { LabelWrapper } from '../wrapper/label/component';
import { TooltipWrapper } from '../wrapper/tooltip/component';

export const DefaultViewWrappers = {
  'form-field': {
    type: MatFormFieldWrapper,
  },
  tooltip: {
    type: TooltipWrapper,
  },
  label: {
    type: LabelWrapper,
  },
  block: {
    type: BlockWrapper,
  },
  form: {
    type: FormWrapper,
  },
};
