import clsx from 'clsx';
import { PropsWithChildren, ReactNode, useCallback } from 'react';
import { View, ViewProps } from 'react-native';
import { DropdownIcon } from 'src/icons/DropdownIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';

import { CheckboxIcon } from '../icons/CheckboxIcon';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Option<T> = {
  id: T;
  icon?: ReactNode;
  label: string;
  disabled?: boolean;
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

  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handlePress = useCallback(() => {
    showBottomSheetModal({
      content: (
        <SelectBottomSheet
          title={title}
          onChange={onChange}
          eventElementId={eventElementId}
          selected={selectedId}
          options={options}
        />
      ),
    });
  }, [eventElementId, onChange, options, selectedId, showBottomSheetModal, title]);

  return (
    <GalleryTouchableOpacity
      style={style}
      onPress={handlePress}
      eventName={`${eventElementId} opened`}
      eventElementId={eventElementId}
      // TODO analytics - prop drill
      eventContext={null}
      className="bg-faint dark:bg-black-500 h-7 py-1 px-2 flex flex-row items-center justify-between"
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

type OptionsProps<ValueType extends string> = {
  style?: ViewProps['style'];
  onChange: (value: ValueType) => void;
  selected: ValueType | null;
  options: Option<ValueType>[];
  eventElementId: string;
};

export function Options<ValueType extends string>({
  selected,
  options,
  style,
  onChange,
  eventElementId,
}: OptionsProps<ValueType>) {
  return (
    <View style={style} className="flex flex-col bg-offWhite dark:bg-black-800 px-3">
      {options.map((option, index) => {
        return (
          <GalleryTouchableOpacity
            key={option.id}
            eventElementId={eventElementId}
            eventName={`${eventElementId} Option Pressed`}
            // TODO analytics - prop drill
            eventContext={null}
            properties={{ value: option.id }}
            onPress={() => onChange(option.id)}
            className={clsx('h-12 flex flex-row items-center justify-between', {
              'border-b border-porcelain dark:border-shadow': index !== options.length - 1,
            })}
            disabled={option.disabled}
          >
            <View
              className={clsx('flex flex-row items-center space-x-1', {
                'opacity-30': option.disabled,
              })}
            >
              {option.icon && (
                <View className="h-4 w-4 flex items-center justify-center">{option.icon}</View>
              )}

              <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                {option.label}
              </Typography>
            </View>

            {selected === option.id && <CheckboxIcon />}
          </GalleryTouchableOpacity>
        );
      })}
    </View>
  );
}

export function Section({ children, style }: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View style={style} className="flex flex-col space-y-2">
      {children}
    </View>
  );
}

export type SelectBottomSheetProps<T extends string> = {
  title: string;
} & OptionsProps<T>;

export function SelectBottomSheet<T extends string>({
  title,
  onChange,
  ...optionsProps
}: SelectBottomSheetProps<T>) {
  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleChange = useCallback<typeof onChange>(
    (...args) => {
      hideBottomSheetModal();
      onChange(...args);
    },
    [hideBottomSheetModal, onChange]
  );

  return (
    <View className="flex flex-col space-y-5">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
        {title}
      </Typography>
      <View className="flex flex-col space-y-4">
        <View className="flex space-y-2">
          <Section>
            <Options onChange={handleChange} {...optionsProps} />
          </Section>
        </View>
      </View>
    </View>
  );
}
