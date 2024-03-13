import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ResizeMode } from 'expo-av';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { AvailableChains, Chain, chains } from 'shared/utils/chains';

import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { Button } from '~/components/Button';
import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAssetToWrapInBoundary } from '~/components/NftPreview/NftPreviewAsset';
import { Typography } from '~/components/Typography';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { NftSelectorPickerGridOneOrManyFragment$key } from '~/generated/NftSelectorPickerGridOneOrManyFragment.graphql';
import { NftSelectorPickerGridQuery } from '~/generated/NftSelectorPickerGridQuery.graphql';
import { NftSelectorPickerGridSinglePreviewFragment$key } from '~/generated/NftSelectorPickerGridSinglePreviewFragment.graphql';
import {
  NftSelectorPickerGridTokenGridFragment$data,
  NftSelectorPickerGridTokenGridFragment$key,
} from '~/generated/NftSelectorPickerGridTokenGridFragment.graphql';
import {
  NftSelectorPickerGridTokensFragment$data,
  NftSelectorPickerGridTokensFragment$key,
} from '~/generated/NftSelectorPickerGridTokensFragment.graphql';
import {
  LoginStackNavigatorProp,
  MainTabStackNavigatorParamList,
  MainTabStackNavigatorProp,
  ScreenWithNftSelector,
} from '~/navigation/types';
import { NftSelectorSortView } from '~/screens/NftSelectorScreen/NftSelectorFilterBottomSheet';
import { NftSelectorPickerSingularAsset } from '~/screens/NftSelectorScreen/NftSelectorPickerSingularAsset';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { doesUserOwnWalletFromChainFamily } from '~/shared/utils/doesUserOwnWalletFromChainFamily';

import { NftSelectorLoadingSkeleton } from './NftSelectorLoadingSkeleton';

type NftSelectorPickerGridProps = {
  style?: ViewProps['style'];
  searchCriteria: {
    searchQuery: string;
    ownerFilter: 'Collected' | 'Created';
    networkFilter: Chain;
    sortView: NftSelectorSortView;
  };
  screen: ScreenWithNftSelector;
  onRefresh: () => void;
};

export function NftSelectorPickerGrid({
  searchCriteria,
  screen,
  style,
  onRefresh,
}: NftSelectorPickerGridProps) {
  const query = useLazyLoadQuery<NftSelectorPickerGridQuery>(
    graphql`
      query NftSelectorPickerGridQuery {
        viewer {
          ... on Viewer {
            user {
              tokens {
                creationTime
                ...NftSelectorPickerGridTokensFragment
              }
              primaryWallet {
                __typename
              }
            }
          }
        }
        ...doesUserOwnWalletFromChainFamilyFragment
      }
    `,
    {}
  );

  const ownsWalletFromSelectedChainFamily = doesUserOwnWalletFromChainFamily(
    searchCriteria.networkFilter,
    query
  );
  const tokenRefs = removeNullValues(query.viewer?.user?.tokens);

  const tokens = useFragment<NftSelectorPickerGridTokensFragment$key>(
    graphql`
      fragment NftSelectorPickerGridTokensFragment on Token @relay(plural: true) {
        definition {
          chain
          contract {
            isSpam
            contractAddress {
              address
            }
          }
          community {
            # Keeping name in the cache so the contract picker screen
            # already has the name in the cache
            # eslint-disable-next-line relay/unused-fields
            name
          }
        }
        creationTime
        isSpamByUser
        ownerIsHolder
        ownerIsCreator

        ...NftSelectorPickerGridTokenGridFragment
        ...NftSelectorPickerGridOneOrManyFragment
      }
    `,
    tokenRefs
  );

  const { openManageWallet } = useManageWalletActions();

  // [GAL-4202] this logic could be consolidated across web editor + web selector + mobile selector
  // but also don't overdo it if there's sufficient differentiation between web and mobile UX
  const filteredTokens = useMemo(() => {
    let filtered = tokens;

    // Filter out spam tokens
    filtered = filtered.filter((token) => {
      const isSpam = token.definition?.contract?.isSpam || token.isSpamByUser;
      return !isSpam;
    });

    // Filter by search query if present
    if (searchCriteria.searchQuery) {
      const searchQueryLower = searchCriteria.searchQuery.toLowerCase();
      filtered = filtered.filter((token) =>
        token.definition?.community?.name?.toLowerCase().includes(searchQueryLower)
      );
    }

    // Filter by network if not 'All Networks'
    if (searchCriteria.networkFilter !== 'All Networks') {
      filtered = filtered.filter(
        (token) => token.definition?.chain === searchCriteria.networkFilter
      );
    }

    // Filter by owner status
    if (searchCriteria.ownerFilter === 'Collected') {
      filtered = filtered.filter((token) => token.ownerIsHolder);
    } else if (searchCriteria.ownerFilter === 'Created') {
      filtered = filtered.filter((token) => token.ownerIsCreator);
    }

    return filtered;
  }, [
    searchCriteria.networkFilter,
    searchCriteria.ownerFilter,
    searchCriteria.searchQuery,
    tokens,
  ]);

  const sortedTokens = useMemo(() => {
    const sortedTokens = [...filteredTokens];

    if (searchCriteria.sortView === 'Recently added') {
      sortedTokens.sort((a, b) => {
        return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
      });
    } else if (searchCriteria.sortView === 'Oldest') {
      sortedTokens.sort((a, b) => {
        return new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime();
      });
    } else if (searchCriteria.sortView === 'Alphabetical') {
      sortedTokens.sort((a, b) => {
        const contractA = a.definition?.community?.name?.toLocaleLowerCase();
        const contractB = b.definition?.community?.name?.toLocaleLowerCase();

        if (contractA && contractB) {
          if (contractA < contractB) {
            return -1;
          }

          if (contractA > contractB) {
            return 1;
          }

          return 0;
        }
        return 0;
      });
    }

    return sortedTokens;
  }, [filteredTokens, searchCriteria.sortView]);

  type Group = {
    address: string;
    tokens: Array<NftSelectorPickerGridTokensFragment$data[number]>;
  };
  type GroupedTokens = Record<string, Group>;
  const groups = useMemo(() => {
    const groups: GroupedTokens = {};

    for (const token of sortedTokens) {
      const address = token?.definition?.contract?.contractAddress?.address;

      if (!address) {
        continue;
      }

      const group = groups[address] ?? { address, tokens: [] };

      if (group.tokens.length >= 4) {
        continue;
      }

      group.tokens.push(token);

      groups[address] = group;
    }

    return groups;
  }, [sortedTokens]);

  const { isSyncing, syncTokens, isSyncingCreatedTokens, syncCreatedTokens } =
    useSyncTokensActions();

  const availableChains = useMemo(() => {
    return chains
      .filter((chain) => chain.name !== 'All Networks')
      .map((chain) => chain.name as AvailableChains);
  }, []);

  // TODO: this logic is messy and shared with web; should be refactored
  const handleRefresh = useCallback(() => {
    if (!ownsWalletFromSelectedChainFamily) {
      return;
    }

    if (searchCriteria.ownerFilter === 'Collected') {
      if (isSyncing) {
        return;
      }
      syncTokens(
        searchCriteria.networkFilter === 'All Networks'
          ? availableChains
          : searchCriteria.networkFilter
      );
      onRefresh();
    }

    if (
      searchCriteria.ownerFilter === 'Created' &&
      searchCriteria.networkFilter !== 'All Networks'
    ) {
      if (isSyncingCreatedTokens) {
        return;
      }
      syncCreatedTokens(searchCriteria.networkFilter);
      onRefresh();
    }
  }, [
    availableChains,
    isSyncing,
    isSyncingCreatedTokens,
    onRefresh,
    ownsWalletFromSelectedChainFamily,
    searchCriteria.networkFilter,
    searchCriteria.ownerFilter,
    syncCreatedTokens,
    syncTokens,
  ]);

  // Auto-sync tokens when the chain or Collected/Created filter changes, and there are 0 tokens to display
  useEffect(() => {
    if (
      ownsWalletFromSelectedChainFamily &&
      sortedTokens.length === 0 &&
      !searchCriteria.searchQuery
    ) {
      handleRefresh();
    }

    // we only want to consider auto-syncing tokens if selectedNetworkView changes, so limit dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCriteria.networkFilter, searchCriteria.ownerFilter]);

  type Row = { groups: Group[] };
  const rows = useMemo(() => {
    const rows: Row[] = [];

    for (let i = 0; i < Object.keys(groups).length; i += 3) {
      rows.push({ groups: Object.values(groups).slice(i, i + 3) });
    }

    return rows;
  }, [groups]);

  const renderItem = useCallback<ListRenderItem<Row>>(
    ({ item }) => {
      return (
        <View className="flex space-x-4 flex-row mb-4 px-4">
          {item.groups.map((group, index) => {
            return (
              <TokenGroup
                key={index}
                tokenRefs={group.tokens}
                contractAddress={group.address}
                ownerFilter={searchCriteria.ownerFilter}
                screen={screen}
              />
            );
          })}

          {/* Fill the remaining space for this row */}
          {Array.from({ length: 3 - item.groups.length }).map((_, index) => {
            return <View key={index} className="flex-1" />;
          })}
        </View>
      );
    },
    [screen, searchCriteria.ownerFilter]
  );

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const handleConnectWallet = useCallback(() => {
    openManageWallet({
      title: 'Connect your wallet to view your collection',
      onSuccess: () => {
        navigation.navigate('OnboardingNftSelector', {
          page: 'ProfilePicture',
          fullScreen: true,
        });
      },
    });
  }, [navigation, openManageWallet]);

  const isRefreshing = isSyncing || isSyncingCreatedTokens;

  if (isRefreshing) {
    return <NftSelectorLoadingSkeleton />;
  }
  const user = query?.viewer?.user;
  if (!user?.primaryWallet) {
    return (
      <View className="flex flex-col flex-1 pt-16 space-y-6 w-[300] mx-auto" style={style}>
        <Typography className="text-lg text-center" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          You need to connect a wallet to see your NFTs
        </Typography>

        <Button
          text="Connect Wallet"
          onPress={handleConnectWallet}
          eventElementId="Connect Wallet Button"
          eventName="Connect Wallet Button pressed"
          eventContext={contexts.Social}
        />
      </View>
    );
  }

  if (!rows.length) {
    return (
      <View className="flex flex-col flex-1 pt-16" style={style}>
        <Typography className="text-lg text-center" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          No NFTs found
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex flex-col flex-1" style={style}>
      <FlashList
        renderItem={renderItem}
        data={rows}
        estimatedItemSize={200}
        refreshControl={
          <GalleryRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

type TokenGridSinglePreviewProps = {
  tokenRef: NftSelectorPickerGridSinglePreviewFragment$key;
};

function TokenGridSinglePreview({ tokenRef }: TokenGridSinglePreviewProps) {
  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);

  const token = useFragment(
    graphql`
      fragment NftSelectorPickerGridSinglePreviewFragment on Token {
        ...TokenFailureBoundaryFragment
        ...NftPreviewAssetToWrapInBoundaryFragment
      }
    `,
    tokenRef
  );

  return (
    <TokenFailureBoundary tokenRef={token} variant="tiny">
      <NftPreviewAssetToWrapInBoundary
        tokenRef={token}
        mediaSize="medium"
        resizeMode={ResizeMode.COVER}
        onLoad={handleAssetLoad}
      />
      {!assetLoaded && (
        <View className="absolute inset-0">
          <GallerySkeleton borderRadius={0}>
            <SkeletonPlaceholder.Item width="100%" height="100%" />
          </GallerySkeleton>
        </View>
      )}
    </TokenFailureBoundary>
  );
}

type TokenGridProps = {
  style?: ViewProps['style'];
  tokenRefs: NftSelectorPickerGridTokenGridFragment$key;
  ownerFilter: 'Created' | 'Collected';
  contractAddress: string;
  screen: ScreenWithNftSelector;
};

function TokenGrid({ tokenRefs, contractAddress, screen, style, ownerFilter }: TokenGridProps) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorPickerGridTokenGridFragment on Token @relay(plural: true) {
        __typename
        dbid
        ...NftSelectorPickerGridSinglePreviewFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();

  const isFullscreen = route.params.fullScreen;

  type Row = { tokens: NftSelectorPickerGridTokenGridFragment$data[number][] };

  const rows: Row[] = useMemo(() => {
    const nonNullTokens = removeNullValues(tokens);

    return [{ tokens: nonNullTokens.slice(0, 2) }, { tokens: nonNullTokens.slice(2, 4) }];
  }, [tokens]);

  const handlePress = useCallback(() => {
    if (screen === 'Onboarding') {
      navigation.navigate('Login', {
        screen: 'OnboardingNftSelectorContract',
        params: {
          contractAddress: contractAddress,
          page: screen,
          ownerFilter: ownerFilter,
          fullScreen: isFullscreen,
        },
      });
      return;
    }

    navigation.navigate('NftSelectorContractScreen', {
      contractAddress: contractAddress,
      page: screen,
      ownerFilter: ownerFilter,
      fullScreen: isFullscreen,
    });
  }, [contractAddress, isFullscreen, navigation, ownerFilter, screen]);

  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      style={style}
      eventElementId="NftSelectorPickerContractGroup"
      eventName={'NftSelectorPickerContractGroup pressed'}
      eventContext={contexts.Posts}
    >
      <View className="flex flex-col space-y-2 p-2">
        {rows.map((row, index) => {
          return (
            <View key={index} className="flex flex-row space-x-2">
              {row.tokens.map((token) => {
                return (
                  <View key={token.dbid} className="flex-1 aspect-square">
                    <TokenGridSinglePreview tokenRef={token} />
                  </View>
                );
              })}

              {Array.from({ length: 2 - row.tokens.length }).map((_, index) => {
                return <View key={index} className="flex-1 aspect-square" />;
              })}
            </View>
          );
        })}
      </View>
    </GalleryTouchableOpacity>
  );
}

type TokenGroupProps = {
  style?: ViewProps['style'];
  ownerFilter: 'Collected' | 'Created';
  tokenRefs: NftSelectorPickerGridOneOrManyFragment$key;
  contractAddress: string;
  screen: ScreenWithNftSelector;
};

function TokenGroup({ tokenRefs, contractAddress, style, ownerFilter, screen }: TokenGroupProps) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorPickerGridOneOrManyFragment on Token @relay(plural: true) {
        ...NftSelectorPickerGridTokenGridFragment
        ...NftSelectorPickerSingularAssetFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleSelectNft = useCallback(() => {
    if (screen === 'Onboarding') {
      navigation.navigate('Login', {
        screen: 'OnboardingProfileBio',
      });
      return;
    }
    navigation.pop();
  }, [navigation, screen]);

  const [firstToken] = tokens;
  if (!firstToken) {
    return null;
  }

  return (
    <View style={style} className="flex-1 aspect-square bg-offWhite dark:bg-black-800">
      {tokens.length === 1 ? (
        <NftSelectorPickerSingularAsset onSelect={handleSelectNft} tokenRef={firstToken} />
      ) : (
        <TokenGrid
          ownerFilter={ownerFilter}
          contractAddress={contractAddress}
          tokenRefs={tokens}
          screen={screen}
        />
      )}
    </View>
  );
}
