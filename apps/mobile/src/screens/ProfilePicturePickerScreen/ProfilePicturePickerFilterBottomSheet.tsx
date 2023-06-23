import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, PropsWithChildren, ReactNode, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { CheckboxIcon } from 'src/icons/CheckboxIcon';
import { EthIcon } from 'src/icons/EthIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { TezosIcon } from 'src/icons/TezosIcon';
import { WorldIcon } from 'src/icons/WorldIcon';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type ProfilePicturePickerFilterBottomSheetProps = {};

type NetworkChoice = 'all' | 'Ethereum' | 'Tezos' | 'POAP';
type SortChoice = 'recent' | 'oldest' | 'alphabetic';

function ProfilePicturePickerFilterBottomSheet(
  {}: ProfilePicturePickerFilterBottomSheetProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const [network, setNetwork] = useState<NetworkChoice>('all');
  const [sort, setSort] = useState<SortChoice>('recent');

  return (
    <GalleryBottomSheetModal
      ref={ref}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="px-8 flex flex-col space-y-5"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
          Filters
        </Typography>

        <Section>
          <SectionHeading>NETWORK</SectionHeading>

          <Options<NetworkChoice>
            onChange={setNetwork}
            selected={network}
            options={[
              { label: 'All Networks', value: 'all', icon: <WorldIcon /> },
              { label: 'Ethereum', value: 'Ethereum', icon: <EthIcon /> },
              { label: 'Tezos', value: 'Tezos', icon: <TezosIcon /> },
              { label: 'POAP', value: 'POAP', icon: <PoapIcon className="w-4 h-4" /> },
            ]}
          />
        </Section>

        <Section>
          <SectionHeading>SORT BY</SectionHeading>

          <Options<SortChoice>
            onChange={setSort}
            selected={sort}
            options={[
              { label: 'Recently Added', value: 'recent' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Alphabetic', value: 'alphabetic' },
            ]}
          />
        </Section>
      </View>
    </GalleryBottomSheetModal>
  );
}

function Options<ValueType extends string>({
  selected,
  options,
  style,
  onChange,
}: {
  style?: ViewProps['style'];
  onChange: (value: ValueType) => void;
  selected: ValueType | null;
  options: Array<{ value: ValueType; icon?: ReactNode; label: string }>;
}) {
  return (
    <View style={style} className="flex flex-col bg-offWhite px-3">
      {options.map((option, index) => {
        return (
          <GalleryTouchableOpacity
            eventElementId="ProfilePictureFilter"
            eventName="ProfilePictureFilter Pressed"
            properties={{ value: option.value }}
            onPress={() => onChange(option.value)}
            key={option.value}
            className={clsx('h-12 flex flex-row items-center justify-between', {
              'border-b border-porcelain': index !== options.length - 1,
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

            {selected === option.value && <CheckboxIcon />}
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

function SectionHeading({ children }: PropsWithChildren) {
  return (
    <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-xs">
      {children}
    </Typography>
  );
}

const ForwardedProfilePicturePickerFilterBottomSheet = forwardRef(
  ProfilePicturePickerFilterBottomSheet
);

export { ForwardedProfilePicturePickerFilterBottomSheet as ProfilePicturePickerFilterBottomSheet };
