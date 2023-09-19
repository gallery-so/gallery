import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { BackButton } from '~/components/BackButton';
import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Pill } from '~/components/Pill';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { NftDetailScreenInnerQuery } from '~/generated/NftDetailScreenInnerQuery.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import TokenViewEmitter from '~/shared/components/TokenViewEmitter';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';

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

const ENABLED_CREATOR = false;

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
            dbid
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
            ownerIsCreator
            owner {
              id
              username
              ...ProfilePictureFragment
            }

            ...NftAdditionalDetailsFragment
            ...NftDetailAssetFragment
          }

          ...shareTokenFragment
          ...TokenFailureBoundaryFragment
        }

        ...useLoggedInUserIdFragment
        ...isFeatureEnabledFragment
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

  const { colorScheme } = useColorScheme();
  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const token = query.tokenById;

  const loggedInUserId = useLoggedInUserId(query);

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const isTokenOwner = loggedInUserId === token.owner?.id;

  const track = useTrack();

  const navigation = useNavigation<MainTabStackNavigatorProp>();

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

  const handleUsernamePress = useCallback(() => {
    if (token.owner?.username) {
      track('NFT Detail Collector Name Clicked', {
        username: token.owner.username,
        contractAddress: token.contract?.contractAddress?.address,
        tokenId: token.tokenId,
      });
      navigation.push('Profile', { username: token.owner.username });
    }
  }, [
    navigation,
    track,
    token.owner?.username,
    token.contract?.contractAddress?.address,
    token.tokenId,
  ]);

  const handleCreatePost = useCallback(() => {
    if (!token.dbid) return;

    navigation.navigate('PostComposer', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  // const handleCreatorPress = useCallback(() => {
  //   if (token.creator?.username) {
  //     track('NFT Detail Creator Name Clicked', {
  //       username: token.creator.username,
  //       contractAddress: token.contract?.contractAddress?.address,
  //       tokenId: token.tokenId,
  //     });
  //     navigation.push('Profile', { username: token.creator.username });
  //   }
  // }, [navigation, track, token.creator?.username]);

  return (
    <ScrollView>
      <View className="flex flex-col space-y-6 px-4 pb-4">
        <View className="flex flex-col space-y-3">
          <View className="flex flex-row justify-between">
            <TokenViewEmitter
              collectionID={route.params.collectionId ?? ''}
              tokenID={route.params.tokenId}
            />
            <BackButton />
            <IconContainer
              eventElementId="NFT Detail Share Icon"
              eventName="NFT Detail Share Icon Clicked"
              icon={<ShareIcon />}
              onPress={handleShare}
            />
          </View>

          <View className="w-full aspect-square">
            <TokenFailureBoundary tokenRef={token}>
              <NftDetailAssetCacheSwapper
                cachedPreviewAssetUrl={route.params.cachedPreviewAssetUrl}
              >
                <NftDetailAsset tokenRef={token} />
              </NftDetailAssetCacheSwapper>
            </TokenFailureBoundary>
          </View>
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

        <View className="flex-row">
          {token.owner && (
            <View className="w-1/2">
              <Typography
                className="text-xs text-shadow dark:text-metal"
                font={{ family: 'ABCDiatype', weight: 'Medium' }}
              >
                {token.ownerIsCreator ? 'CREATOR' : 'OWNER'}
              </Typography>

              <GalleryTouchableOpacity
                className="flex flex-row items-center space-x-1"
                onPress={handleUsernamePress}
                eventElementId="NFT Detail Token Owner Username"
                eventName="NFT Detail Token Owner Username"
              >
                {token.owner.username && <ProfilePicture userRef={token.owner} size="xs" />}

                <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                  {token.owner.username}
                </Typography>
              </GalleryTouchableOpacity>
            </View>
          )}
          {ENABLED_CREATOR && (
            <View className="w-1/2">
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                CREATOR
              </Typography>

              <InteractiveLink onPress={handleUsernamePress} type="NFT Detail Token Creator">
                riley.eth
              </InteractiveLink>
              <InteractiveLink onPress={handleUsernamePress} type="NFT Detail Token Creator">
                riley.eth
              </InteractiveLink>
            </View>
          )}
        </View>

        {token.description && (
          <View>
            <Markdown style={markdownStyles}>{token.description}</Markdown>
          </View>
        )}

        {isKoalaEnabled && isTokenOwner && (
          <Button
            icon={
              <PostIcon
                width={24}
                strokeWidth={1.5}
                color={colorScheme === 'dark' ? colors.black['800'] : colors.white}
              />
            }
            eventElementId={null}
            eventName={null}
            onPress={handleCreatePost}
            text="create post"
          />
        )}

        <View className="flex-1">
          <NftAdditionalDetails tokenRef={token} />
        </View>
      </View>
    </ScrollView>
  );
}
