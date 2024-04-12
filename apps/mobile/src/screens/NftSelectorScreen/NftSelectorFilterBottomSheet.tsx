import { forwardRef, useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';

import { Options, Section } from '~/components/Select';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { ChainMetadata, isSupportedChainForCreators } from '~/shared/utils/chains';

const OWNER_OPTIONS: { label: string; id: 'Collected' | 'Created' }[] = [
  { id: 'Collected', label: 'Collected' },
  { id: 'Created', label: 'Created' },
];

const SORT_VIEWS: { label: string; id: NftSelectorSortView }[] = [
  { label: 'Recently added', id: 'Recently added' },
  { label: 'Oldest', id: 'Oldest' },
  { label: 'Alphabetical', id: 'Alphabetical' },
];

type Props = {
  ownerFilter: 'Created' | 'Collected';
  onOwnerFilterChange: (filter: 'Created' | 'Collected') => void;

  sortView: NftSelectorSortView;
  onSortViewChange: (sortView: NftSelectorSortView) => void;

  selectedNetwork: NetworkChoice;
};

export type NetworkChoice = ChainMetadata['name'];
export type NftSelectorSortView = 'Recently added' | 'Oldest' | 'Alphabetical';

function NftSelectorFilterBottomSheet({
  ownerFilter,
  onOwnerFilterChange,
  sortView,
  onSortViewChange,
  selectedNetwork,
}: Props) {
  const { hideBottomSheetModal } = useBottomSheetModalActions();
  const handleClose = useCallback(() => {
    hideBottomSheetModal();
  }, [hideBottomSheetModal]);

  const handleOwnerFilterChange = useCallback(
    (filter: 'Created' | 'Collected') => {
      onOwnerFilterChange(filter);
      handleClose();
    },
    [onOwnerFilterChange, handleClose]
  );

  const handleSortViewChange = useCallback(
    (sortView: NftSelectorSortView) => {
      onSortViewChange(sortView);
      handleClose();
    },
    [onSortViewChange, handleClose]
  );

  const decoratedOwnerOptions = useMemo(() => {
    return OWNER_OPTIONS.map((ownerOption) => {
      if (ownerOption.id === 'Created') {
        return {
          ...ownerOption,
          disabled: !isSupportedChainForCreators(selectedNetwork),
        };
      }
      return ownerOption;
    });
  }, [selectedNetwork]);

  return (
    <View className="flex flex-col space-y-6">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
        Filters
      </Typography>
      <View className="flex flex-col space-y-4">
        <FilterSection title="Type">
          <Section>
            <Options
              onChange={handleOwnerFilterChange}
              selected={ownerFilter}
              options={decoratedOwnerOptions}
              eventElementId="Owner filter"
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
