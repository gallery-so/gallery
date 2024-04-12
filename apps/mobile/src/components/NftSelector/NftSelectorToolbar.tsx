import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import { chains } from 'shared/utils/chains';
import { SlidersIcon } from 'src/icons/SlidersIcon';
import { getChainIconComponent } from 'src/utils/getChainIconComponent';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import {
  NetworkChoice,
  NftSelectorFilterBottomSheet,
  NftSelectorSortView,
} from '~/screens/NftSelectorScreen/NftSelectorFilterBottomSheet';

import { AnimatedRefreshIcon } from '../AnimatedRefreshIcon';
import { FadedInput } from '../FadedInput';
import { IconContainer } from '../IconContainer';
import { Select } from '../Select';

const NETWORKS: {
  label: string;
  id: NetworkChoice;
  icon: JSX.Element;
  hasCreatorSupport: boolean;
}[] = [
  ...chains.map((chain) => ({
    label: chain.name,
    id: chain.name,
    icon: getChainIconComponent(chain),
    hasCreatorSupport: chain.hasCreatorSupport,
  })),
];

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  ownershipTypeFilter: 'Collected' | 'Created';
  setFilter: (value: 'Collected' | 'Created') => void;
  networkFilter: NetworkChoice;
  setNetworkFilter: (value: NetworkChoice) => void;
  sortView: NftSelectorSortView;
  setSortView: (value: NftSelectorSortView) => void;
  isSyncing: boolean;
  isSyncingCreatedTokens: boolean;
  handleSync: () => void;
  style?: ViewProps['style'];
};

export function NftSelectorToolbar({
  searchQuery,
  setSearchQuery,
  ownershipTypeFilter,
  setFilter,
  networkFilter,
  setNetworkFilter,
  sortView,
  setSortView,
  isSyncing,
  isSyncingCreatedTokens,
  handleSync,
  style,
}: Props) {
  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleSettingsPress = useCallback(() => {
    showBottomSheetModal({
      content: (
        <NftSelectorFilterBottomSheet
          ownerFilter={ownershipTypeFilter}
          onOwnerFilterChange={setFilter}
          sortView={sortView}
          onSortViewChange={setSortView}
          selectedNetwork={networkFilter}
        />
      ),
    });
  }, [networkFilter, ownershipTypeFilter, setFilter, setSortView, showBottomSheetModal, sortView]);

  const decoratedNetworks = useMemo(() => {
    return NETWORKS.map((network) => {
      return {
        ...network,
        disabled: ownershipTypeFilter === 'Created' && !network.hasCreatorSupport,
      };
    });
  }, [ownershipTypeFilter]);

  const handleNetworkChange = useCallback(
    (network: NetworkChoice) => {
      setNetworkFilter(network);
    },
    [setNetworkFilter]
  );

  return (
    <View className="flex flex-col space-y-4" style={style}>
      <View className="px-4">
        <FadedInput
          inputMode="search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ height: 36 }}
          icon={<SearchIcon width={16} height={16} />}
          placeholder="Search pieces"
        />
      </View>

      <View className="px-4 flex flex-row items-center justify-between">
        <Select
          className="w-32"
          title="Network"
          eventElementId="NftSelectorNetworkFilter"
          onChange={handleNetworkChange}
          selectedId={networkFilter}
          options={decoratedNetworks}
        />

        <View className="flex flex-row space-x-1">
          <AnimatedRefreshIcon
            onSync={handleSync}
            isSyncing={ownershipTypeFilter === 'Collected' ? isSyncing : isSyncingCreatedTokens}
            eventElementId="NftSelectorSelectorRefreshButton"
            eventName="NftSelectorSelectorRefreshButton pressed"
          />

          <IconContainer
            size="sm"
            onPress={handleSettingsPress}
            icon={<SlidersIcon />}
            eventElementId="NftSelectorSelectorSettingsButton"
            eventName="NftSelectorSelectorSettingsButton pressed"
            eventContext={contexts.Posts}
          />
        </View>
      </View>
    </View>
  );
}
