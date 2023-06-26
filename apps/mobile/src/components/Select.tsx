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
  className?: string;
  style?: ViewProps['style'];
  eventElementId: string;
  onChange: (id: T) => void;
};

export function Select<T extends string>({
  style,
  options,
  selectedId,
  eventElementId,
}: SelectProps<T>) {
  const selected = options.find((option) => option.id === selectedId);

  return (
    <GalleryTouchableOpacity
      style={style}
      eventName={`${eventElementId} opened`}
      eventElementId={eventElementId}
      className="bg-faint h-7 py-1 px-2 flex flex-row items-center justify-between space-x-2"
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
