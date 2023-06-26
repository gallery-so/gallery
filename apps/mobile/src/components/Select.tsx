import { View, ViewProps } from 'react-native';
import { DropdownIcon } from 'src/icons/DropdownIcon';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Option<T> = {
  id: T;
  label: string;
};

export type SelectProps<T> = {
  selectedId: T;
  options: Option<T>[];
  onChange: (id: T) => void;

  className?: string;
  style?: ViewProps['style'];
};

export function Select<T extends string>({ selectedId, options, onChange, style }: SelectProps<T>) {
  const selected = options.find((option) => option.id === selectedId);

  return (
    <GalleryTouchableOpacity
      className="bg-faint h-7 py-1 px-2 flex flex-row items-center justify-between space-x-2"
      style={style}
    >
      <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-sm">
        {selected?.label}
      </Typography>

      <View className="flex flex-col">
        <DropdownIcon />
      </View>
    </GalleryTouchableOpacity>
  );
}
