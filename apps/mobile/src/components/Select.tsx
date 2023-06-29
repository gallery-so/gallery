import { useCallback, useMemo } from 'react';
import { NativeSyntheticEvent, View, ViewProps } from 'react-native';
import ContextMenu, {
  ContextMenuOnPressNativeEvent,
  ContextMenuProps,
} from 'react-native-context-menu-view';
import { DropdownIcon } from 'src/icons/DropdownIcon';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Option<T> = {
  id: T;
  label: string;
};

export type SelectProps<T> = {
  selectedId: T;
  title: string;
  options: Option<T>[];
  className?: string;
  style?: ViewProps['style'];
  eventElementId: string;
  onChange: (id: T) => void;
};

export function Select<T extends string>({
  style,
  title,
  options,
  onChange,
  selectedId,
  eventElementId,
}: SelectProps<T>) {
  const selected = options.find((option) => option.id === selectedId);

  const actions = useMemo<ContextMenuProps['actions']>(() => {
    return options.map((option) => {
      return {
        title: option.label,
      };
    });
  }, [options]);

  const handlePress = useCallback((event: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const pressedLabel = event.nativeEvent.name;
    const pressedOption = options.find((option) => option.label === pressedLabel);

    if (pressedOption) {
      onChange?.(pressedOption.id);
    }
  }, []);

  return (
    <ContextMenu onPress={handlePress} title={title} dropdownMenuMode actions={actions}>
      <GalleryTouchableOpacity
        style={style}
        eventName={`${eventElementId} opened`}
        eventElementId={eventElementId}
        className="bg-faint dark:bg-black-500 h-7 py-1 px-2 flex flex-row items-center justify-between space-x-2"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-sm">
          {selected?.label}
        </Typography>

        <View className="flex flex-col">
          <DropdownIcon />
        </View>
      </GalleryTouchableOpacity>
    </ContextMenu>
  );
}
