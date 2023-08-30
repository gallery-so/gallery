import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { getChainIconComponent } from 'src/utils/getChainIconComponent';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Options, Section } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { ChainMetadata, chains } from '~/shared/utils/chains';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

const NETWORKS: { label: string; id: NetworkChoice; icon: JSX.Element }[] = [
  ...chains.map((chain) => ({
    label: chain.name,
    id: chain.name,
    icon: getChainIconComponent(chain),
  })),
];

const SORT_VIEWS: { label: string; id: NftSelectorSortView }[] = [
  { label: 'Recently added', id: 'Recently added' },
  { label: 'Oldest', id: 'Oldest' },
  { label: 'Alphabetical', id: 'Alphabetical' },
];

type Props = {
  network: NetworkChoice;
  onNetworkChange: (network: NetworkChoice) => void;

  sortView: NftSelectorSortView;
  onSortViewChange: (sortView: NftSelectorSortView) => void;
};

export type NetworkChoice = ChainMetadata['name'];
export type NftSelectorSortView = 'Recently added' | 'Oldest' | 'Alphabetical';

function NftSelectorFilterBottomSheet(
  { network, onNetworkChange, sortView, onSortViewChange }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleNetworkChange = useCallback(
    (network: NetworkChoice) => {
      onNetworkChange(network);
      handleClose();
    },
    [onNetworkChange, handleClose]
  );

  const handleSortViewChange = useCallback(
    (sortView: NftSelectorSortView) => {
      onSortViewChange(sortView);
      handleClose();
    },
    [onSortViewChange, handleClose]
  );

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
          Filters
        </Typography>
        <View className="flex flex-col space-y-4">
          <FilterSection title="Network">
            <Section>
              <Options
                onChange={handleNetworkChange}
                selected={network}
                options={NETWORKS}
                eventElementId="Network filter"
              />
            </Section>
          </FilterSection>
          <FilterSection title="Sort by">
            <Section>
              <Options
                onChange={handleSortViewChange}
                selected={sortView}
                options={SORT_VIEWS}
                eventElementId="Sort by filter"
              />
            </Section>
          </FilterSection>
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  style?: ViewProps['style'];
};
function FilterSection({ title, children, style }: FilterSectionProps) {
  return (
    <View className="flex space-y-2" style={style}>
      <Typography font={{ family: 'ABCDiatype', weight: 'Medium' }} className="text-xs uppercase">
        {title}
      </Typography>

      {children}
    </View>
  );
}

const ForwardedNftSelectorFilterBottomSheet = forwardRef(NftSelectorFilterBottomSheet);

export { ForwardedNftSelectorFilterBottomSheet as NftSelectorFilterBottomSheet };
