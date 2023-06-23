type Option = {
  id: string;
  label: string;
};

export type SelectProps = {
  selected: Option;
  options: Option[];
};

export function Select() {}
