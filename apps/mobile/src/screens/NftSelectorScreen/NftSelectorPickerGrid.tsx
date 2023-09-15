import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ResizeMode } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { Typography } from '~/components/Typography';
import { NftSelectorPickerGridFragment$key } from '~/generated/NftSelectorPickerGridFragment.graphql';
import { NftSelectorPickerGridOneOrManyFragment$key } from '~/generated/NftSelectorPickerGridOneOrManyFragment.graphql';
import { NftSelectorPickerGridTokenGridFragment$key } from '~/generated/NftSelectorPickerGridTokenGridFragment.graphql';
import {
  NftSelectorPickerGridTokensFragment$data,
  NftSelectorPickerGridTokensFragment$key,
} from '~/generated/NftSelectorPickerGridTokensFragment.graphql';
import {
  MainTabStackNavigatorParamList,
  MainTabStackNavigatorProp,
  ScreenWithNftSelector,
} from '~/navigation/types';
import {
  NetworkChoice,
  NftSelectorSortView,
} from '~/screens/NftSelectorScreen/NftSelectorFilterBottomSheet';
import { NftSelectorPickerSingularAsset } from '~/screens/NftSelectorScreen/NftSelectorPickerSingularAsset';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type NftSelectorPickerGridProps = {
  style?: ViewProps['style'];
  searchCriteria: {
    searchQuery: string;
    ownerFilter: 'Collected' | 'Created';
    networkFilter: NetworkChoice;
    sortView: NftSelectorSortView;
  };
  screen: ScreenWithNftSelector;

  queryRef: NftSelectorPickerGridFragment$key;
};

export function NftSelectorPickerGrid({
  queryRef,
  searchCriteria,
  screen,
  style,
}: NftSelectorPickerGridProps) {
  const query = useFragment(
    graphql`
      fragment NftSelectorPickerGridFragment on Query {
        viewer {
          ... on Viewer {
            user {
              tokens {
                creationTime
                ...NftSelectorPickerGridTokensFragment
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const tokenRefs = removeNullValues(query.viewer?.user?.tokens);

  const tokens = useFragment<NftSelectorPickerGridTokensFragment$key>(
    graphql`
      fragment NftSelectorPickerGridTokensFragment on Token @relay(plural: true) {
        chain
        isSpamByUser
        isSpamByProvider
        creationTime

        contract {
          # Keeping name in the cache so the contract picker screen
          # already has the name in the cache
          # eslint-disable-next-line relay/unused-fields
          name
          contractAddress {
            address
          }
        }

        ownerIsHolder
        ownerIsCreator

        ...getVideoOrImageUrlForNftPreviewFragment
        ...NftSelectorPickerGridTokenGridFragment
        ...NftSelectorPickerGridOneOrManyFragment
      }
    `,
    tokenRefs
  );

  // [GAL-4202] this logic could be consolidated across web editor + web selector + mobile selector
  // but also don't overdo it if there's sufficient differentiation between web and mobile UX
  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => {
        const isSpam = token.isSpamByProvider || token.isSpamByUser;

        return !isSpam;
      })
      .filter((token) => {
        if (!searchCriteria.searchQuery) {
          return true;
        }

        return token?.contract?.name
          ?.toLowerCase()
          .includes(searchCriteria.searchQuery.toLowerCase());
      })
      .filter((token) => {
        return token.chain === searchCriteria.networkFilter;
      })
      .filter((token) => {
        if (searchCriteria.ownerFilter === 'Collected') {
          return token.ownerIsHolder;
        }

        return token.ownerIsCreator;
      });
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
        const contractA = a.contract?.name?.toLocaleLowerCase();
        const contractB = b.contract?.name?.toLocaleLowerCase();

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
      const address = token?.contract?.contractAddress?.address;

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
    [screen]
  );

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
      <FlashList renderItem={renderItem} data={rows} estimatedItemSize={200} />
    </View>
  );
}

function TokenGridSinglePreview({ tokenUrl }: { tokenUrl: string }) {
  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);
  return (
    <>
      <NftPreviewAsset tokenUrl={tokenUrl} resizeMode={ResizeMode.COVER} onLoad={handleAssetLoad} />
      {!assetLoaded && (
        <View className="absolute inset-0">
          <GallerySkeleton borderRadius={0}>
            <SkeletonPlaceholder.Item width="100%" height="100%" />
          </GallerySkeleton>
        </View>
      )}
    </>
  );
}

type TokenGridProps = {
  style?: ViewProps['style'];
  tokenRefs: NftSelectorPickerGridTokenGridFragment$key;
  contractAddress: string;
  screen: ScreenWithNftSelector;
};

function TokenGrid({ tokenRefs, contractAddress, screen, style }: TokenGridProps) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorPickerGridTokenGridFragment on Token @relay(plural: true) {
        __typename

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftSelectorContractScreen'>>();

  const isFullscreen = route.params.fullScreen;

  type Row = { tokens: string[] };

  const rows: Row[] = useMemo(() => {
    const tokenUrls = removeNullValues(
      tokens.map((token) => {
        const url = getVideoOrImageUrlForNftPreview({ tokenRef: token })?.urls.medium;

        return url;
      })
    );

    return [{ tokens: tokenUrls.slice(0, 2) }, { tokens: tokenUrls.slice(2, 4) }];
  }, [tokens]);

  return (
    <GalleryTouchableOpacity
      onPress={() => {
        navigation.navigate('NftSelectorContractScreen', {
          contractAddress: contractAddress,
          page: screen,
          fullScreen: isFullscreen,
        });
      }}
      style={style}
      eventElementId="NftSelectorPickerContractGroup"
      eventName={'NftSelectorPickerContractGroup pressed'}
    >
      <View className="flex flex-col space-y-2 p-2">
        {rows.map((row, index) => {
          return (
            <View key={index} className="flex flex-row space-x-2">
              {row.tokens.map((tokenUrl) => {
                return (
                  <View key={tokenUrl} className="flex-1 aspect-square">
                    <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
                      <TokenGridSinglePreview tokenUrl={tokenUrl} />
                    </ReportingErrorBoundary>
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
  tokenRefs: NftSelectorPickerGridOneOrManyFragment$key;
  contractAddress: string;
  screen: ScreenWithNftSelector;
};

function TokenGroup({ tokenRefs, contractAddress, style, screen }: TokenGroupProps) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorPickerGridOneOrManyFragment on Token @relay(plural: true) {
        ...NftSelectorPickerGridTokenGridFragment
        ...getVideoOrImageUrlForNftPreviewFragment
        ...NftSelectorPickerSingularAssetFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleSelectNft = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const [firstToken] = tokens;
  if (!firstToken) {
    return null;
  }

  return (
    <View style={style} className="flex-1 aspect-square bg-offWhite dark:bg-black-800">
      {tokens.length === 1 ? (
        <NftSelectorPickerSingularAsset onSelect={handleSelectNft} tokenRef={firstToken} />
      ) : (
        <TokenGrid contractAddress={contractAddress} tokenRefs={tokens} screen={screen} />
      )}
    </View>
  );
}
