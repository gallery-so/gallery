import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BackButton } from '~/components/BackButton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { NftDetailScreenInnerQuery } from '~/generated/NftDetailScreenInnerQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';

import { IconContainer } from '../../components/IconContainer';
import { InteractiveLink } from '../../components/InteractiveLink';
import { Markdown } from '../../components/Markdown';
import { Typography } from '../../components/Typography';
import { PoapIcon } from '../../icons/PoapIcon';
import { ShareIcon } from '../../icons/ShareIcon';
import { shareToken } from '../../utils/shareToken';
import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetailAsset } from './NftDetailAsset/NftDetailAsset';

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

export function NftDetailScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useLazyLoadQuery<NftDetailScreenInnerQuery>(
    graphql`
      query NftDetailScreenInnerQuery($tokenId: DBID!, $collectionId: DBID!) {
        collectionTokenById(tokenId: $tokenId, collectionId: $collectionId) {
          ... on CollectionToken {
            collection {
              ...shareTokenCollectionFragment
            }
          }
        }

        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            name
            chain
            tokenId
            description

            contract {
              name
              badgeURL
              contractAddress {
                address
                chain
              }
            }

            ...NftAdditionalDetailsFragment
            ...NftDetailAssetFragment
          }

          ...shareTokenFragment
        }
      }
    `,
    {
      tokenId: route.params.tokenId,
      collectionId: route.params.collectionId ?? 'definitely-not-a-collection',
    }
    // Use one of these if you want to test with a specific NFT
    // POAP
    // { tokenId: '2Hu1U34d5UpXWDoVNOkMtguCEpk' }
    // FX Hash
    // { tokenId: '2FmsnRrmb57vIMXuvhzojbVLWCG' }
    // Tezos
    // { tokenId: '2EpXhetYK92diIazWW9iQlC9i6W' }
    // Eth
    // { tokenId: '2EpXhbAjixRMTIveYgoCkpxFAzJ' }
    // Art Gobbler
    // { tokenId: '2GupK6MPJnGukvC36QV3pOYvheS' }
    // SVG
    // { tokenId: '2O1TnqK7sbhbdlAeQwLFkxo8T9i' }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const toggleAdditionalDetails = useCallback(() => {
    setShowAdditionalDetails((previous) => !previous);
  }, []);

  const handleShare = useCallback(() => {
    shareToken(token, query.collectionTokenById?.collection ?? null);
  }, [query.collectionTokenById, token]);

  const handleOpenCommunityScreen = useCallback(() => {
    const contractAddress = token.contract?.contractAddress;
    const { address, chain } = contractAddress ?? {};
    if (!address || !chain) return;
    navigation.push('Community', {
      contractAddress: address,
      chain,
    });
  }, [navigation, token.contract?.contractAddress]);

  return (
    <ScrollView>
      <View className="flex flex-col space-y-8 px-4 pb-4">
        <View className="flex flex-col space-y-3">
          <View className="flex flex-row justify-between">
            <BackButton />
            <IconContainer
              eventElementId="NFT Detail Share Icon"
              eventName="NFT Detail Share Icon Clicked"
              icon={<ShareIcon />}
              onPress={handleShare}
            />
          </View>

          <NftDetailAssetCacheSwapper cachedPreviewAssetUrl={route.params.cachedPreviewAssetUrl}>
            <NftDetailAsset tokenRef={token} />
          </NftDetailAssetCacheSwapper>
        </View>

        <View className="flex flex-col space-y-4">
          <Typography
            className="text-2xl"
            font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
          >
            {token.name}
          </Typography>

          {token.contract?.name ? (
            <GalleryTouchableOpacity
              eventElementId="NFT Detail Contract Name Pill"
              eventName="NFT Detail Contract Name Pill Clicked"
            >
              <Pill className="flex flex-row space-x-1 self-start">
                {token.chain === 'POAP' && <PoapIcon className="h-6 w-6" />}
                {token.contract?.badgeURL && (
                  <FastImage className="h-6 w-6" source={{ uri: token.contract.badgeURL }} />
                )}
                <GalleryTouchableOpacity
                  onPress={handleOpenCommunityScreen}
                  eventElementId="Community Pill"
                  eventName="Community Pill Clicked"
                >
                  <Typography numberOfLines={1} font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                    {token.contract.name}
                  </Typography>
                </GalleryTouchableOpacity>
              </Pill>
            </GalleryTouchableOpacity>
          ) : null}
        </View>

        {token.description && (
          <View>
            <Markdown style={markdownStyles}>{token.description}</Markdown>
          </View>
        )}

        <View className="flex-1">
          <NftAdditionalDetails showDetails={showAdditionalDetails} tokenRef={token} />
        </View>

        <View>
          <InteractiveLink onPress={toggleAdditionalDetails}>
            {showAdditionalDetails ? 'Hide Details' : 'Show Additional Details'}
          </InteractiveLink>
        </View>
      </View>
    </ScrollView>
  );
}
