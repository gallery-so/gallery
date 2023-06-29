import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ResizeMode } from 'expo-av';
import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { ProfilePicturePickerGridFragment$key } from '~/generated/ProfilePicturePickerGridFragment.graphql';
import { ProfilePicturePickerGridOneOrManyFragment$key } from '~/generated/ProfilePicturePickerGridOneOrManyFragment.graphql';
import { ProfilePicturePickerGridTokenGridFragment$key } from '~/generated/ProfilePicturePickerGridTokenGridFragment.graphql';
import {
  ProfilePicturePickerGridTokensFragment$data,
  ProfilePicturePickerGridTokensFragment$key,
} from '~/generated/ProfilePicturePickerGridTokensFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { ProfilePicturePickerSingularAsset } from '~/screens/ProfilePicturePickerScreen/ProfilePicturePickerSingularAsset';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type ProfilePicturePickerGridProps = {
  style?: ViewProps['style'];
  queryRef: ProfilePicturePickerGridFragment$key;
};

export function ProfilePicturePickerGrid({ queryRef, style }: ProfilePicturePickerGridProps) {
  const query = useFragment(
    graphql`
      fragment ProfilePicturePickerGridFragment on Query {
        viewer {
          ... on Viewer {
            user {
              tokens {
                ...ProfilePicturePickerGridTokensFragment
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const tokenRefs = removeNullValues(query.viewer?.user?.tokens);

  const tokens = useFragment<ProfilePicturePickerGridTokensFragment$key>(
    graphql`
      fragment ProfilePicturePickerGridTokensFragment on Token @relay(plural: true) {
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
        ...ProfilePicturePickerGridTokenGridFragment
        ...ProfilePicturePickerGridOneOrManyFragment
      }
    `,
    tokenRefs
  );

  type Group = {
    address: string;
    tokens: Array<ProfilePicturePickerGridTokensFragment$data[number]>;
  };
  type GroupedTokens = Record<string, Group>;
  const groups = useMemo(() => {
    const groups: GroupedTokens = {};

    for (const token of tokens) {
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
  }, [tokens]);

  type Row = { groups: Group[] };
  const rows = useMemo(() => {
    const rows: Row[] = [];

    for (let i = 0; i < Object.keys(groups).length; i += 3) {
      rows.push({ groups: Object.values(groups).slice(i, i + 3) });
    }

    return rows;
  }, [groups]);

  const renderItem = useCallback<ListRenderItem<Row>>(({ item }) => {
    return (
      <View className="flex space-x-4 flex-row mb-4 px-4">
        {item.groups.map((group, index) => {
          return (
            <TokenGroup key={index} tokenRefs={group.tokens} contractAddress={group.address} />
          );
        })}

        {/* Fill the remaining space for this row */}
        {Array.from({ length: 3 - item.groups.length }).map((_, index) => {
          return <View key={index} className="flex-1" />;
        })}
      </View>
    );
  }, []);

  return (
    <View className="flex flex-col flex-1" style={style}>
      <FlashList renderItem={renderItem} data={rows} estimatedItemSize={200} />
    </View>
  );
}

type TokenGridProps = {
  style?: ViewProps['style'];
  tokenRefs: ProfilePicturePickerGridTokenGridFragment$key;
  contractAddress: string;
};

function TokenGrid({ tokenRefs, contractAddress, style }: TokenGridProps) {
  const tokens = useFragment(
    graphql`
      fragment ProfilePicturePickerGridTokenGridFragment on Token @relay(plural: true) {
        __typename

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

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
        navigation.navigate('ProfilePicturePickerContract', {
          contractAddress: contractAddress,
        });
      }}
      style={style}
      eventElementId="ProfilePicturePickerContractGroup"
      eventName={'ProfilePicturePickerContractGroup pressed'}
    >
      <View className="flex flex-col space-y-2 p-2">
        {rows.map((row, index) => {
          return (
            <View key={index} className="flex flex-row space-x-2">
              {row.tokens.map((tokenUrl) => {
                return (
                  <View key={tokenUrl} className="flex-1 aspect-square">
                    <NftPreviewAsset tokenUrl={tokenUrl} resizeMode={ResizeMode.COVER} />
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
  tokenRefs: ProfilePicturePickerGridOneOrManyFragment$key;
  contractAddress: string;
};

function TokenGroup({ tokenRefs, contractAddress, style }: TokenGroupProps) {
  const tokens = useFragment(
    graphql`
      fragment ProfilePicturePickerGridOneOrManyFragment on Token @relay(plural: true) {
        ...ProfilePicturePickerGridTokenGridFragment
        ...getVideoOrImageUrlForNftPreviewFragment
        ...ProfilePicturePickerSingularAssetFragment
      }
    `,
    tokenRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleProfilePictureChange = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const [firstToken] = tokens;
  if (!firstToken) {
    return null;
  }

  return (
    <View style={style} className="flex-1 aspect-square bg-offWhite dark:bg-black-800">
      {tokens.length === 1 ? (
        <ProfilePicturePickerSingularAsset
          onProfilePictureChange={handleProfilePictureChange}
          tokenRef={firstToken}
        />
      ) : (
        <TokenGrid contractAddress={contractAddress} tokenRefs={tokens} />
      )}
    </View>
  );
}
