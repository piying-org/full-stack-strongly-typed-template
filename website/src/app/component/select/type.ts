export interface SelectOption {
  readonly label?: string;
  readonly value: any;
  readonly description?: string;
  readonly disabled?: boolean;
  /** 样式代替label */
  readonly style?: any;
}
