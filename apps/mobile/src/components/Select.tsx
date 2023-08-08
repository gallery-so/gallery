import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, PropsWithChildren, ReactNode, useCallback, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { DropdownIcon } from 'src/icons/DropdownIcon';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

import { CheckboxIcon } from '../icons/CheckboxIcon';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Option<T> = {
  id: T;
  icon?: ReactNode;
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
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handlePress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <GalleryTouchableOpacity
      style={style}
      onPress={handlePress}
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

      <SelectBottomSheet
        bottomSheetRef={bottomSheetRef}
        title={title}
        onChange={onChange}
        eventElementId={eventElementId}
        selected={selectedId}
        options={options}
      />
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

function Options<ValueType extends string>({
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
            properties={{ value: option.id }}
            onPress={() => onChange(option.id)}
            className={clsx('h-12 flex flex-row items-center justify-between', {
              'border-b border-porcelain dark:border-shadow': index !== options.length - 1,
            })}
          >
            <View className="flex flex-row items-center space-x-1">
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

function Section({ children, style }: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View style={style} className="flex flex-col space-y-2">
      {children}
    </View>
  );
}

export type SelectBottomSheetProps<T extends string> = {
  title: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType>;
} & OptionsProps<T>;

export function SelectBottomSheet<T extends string>({
  title,
  bottomSheetRef,
  onChange,
  ...optionsProps
}: SelectBottomSheetProps<T>) {
  const { bottom } = useSafeAreaPadding();

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const internalRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleChange = useCallback<typeof onChange>(
    (...args) => {
      internalRef.current?.close();

      onChange(...args);
    },
    [onChange]
  );

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        internalRef.current = value;

        if (bottomSheetRef) {
          if (typeof bottomSheetRef === 'function') {
            bottomSheetRef(value);
          } else {
            bottomSheetRef.current = value;
          }
        }
      }}
      snapPoints={animatedSnapPoints.value}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="px-8 flex flex-col space-y-5"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
          {title}
        </Typography>

        <Section>
          <Options onChange={handleChange} {...optionsProps} />
        </Section>
      </View>
    </GalleryBottomSheetModal>
  );
}
