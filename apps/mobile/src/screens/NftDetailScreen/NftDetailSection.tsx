import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { PoapIcon } from 'src/icons/PoapIcon';
import { ShareIcon } from 'src/icons/ShareIcon';

import { BackButton } from '~/components/BackButton';
import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { LinkableAddress } from '~/components/LinkableAddress';
import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { Typography } from '~/components/Typography';
import { NftDetailSectionQueryFragment$key } from '~/generated/NftDetailSectionQueryFragment.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import TokenViewEmitter from '~/shared/components/TokenViewEmitter';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetailAsset } from './NftDetailAsset/NftDetailAsset';
import { NftDetailAssetCacheSwapper } from './NftDetailAsset/NftDetailAssetCacheSwapper';

type Props = {
  onShare: () => void;
  queryRef: NftDetailSectionQueryFragment$key;
};

const markdownStyle = StyleSheet.create({
  body: {
    fontSize: 14,
  },
  heading1: {
    fontSize: 14,
  },
  hr: {
    height: 15,
    backgroundColor: 'transparent',
  },
});

export function NftDetailSection({ onShare, queryRef }: Props) {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useFragment(
    graphql`
      fragment NftDetailSectionQueryFragment on Query {
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
              creatorAddress {
                address
                ...LinkableAddressFragment
              }
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
            community {
              creator {
                __typename
                ... on GalleryUser {
                  username
                  universal

                  ...ProfilePictureFragment
                }
                ... on ChainAddress {
                  address
                }
              }
            }

            ...NftAdditionalDetailsFragment
            ...NftDetailAssetFragment
            ...TokenFailureBoundaryFragment
            ...extractRelevantMetadataFromTokenFragment
          }
        }
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const { colorScheme } = useColorScheme();

  const token = query.tokenById;

  const loggedInUserId = useLoggedInUserId(query);

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const isTokenOwner = loggedInUserId === token.owner?.id;

  const track = useTrack();

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleOpenCommunityScreen = useCallback(() => {
    const contractAddress = token.contract?.contractAddress;
    const { address, chain } = contractAddress ?? {};
    if (!address || !chain) return;
    navigation.push('Community', {
      contractAddress: address,
      chain,
    });
  }, [navigation, token.contract?.contractAddress]);

  const handleUsernamePress = useCallback(
    (username: any, contractAddress: any) => {
      if (username) {
        track('NFT Detail Collector Name Clicked', {
          username: username,
          contractAddress: contractAddress,
          tokenId: token.tokenId,
        });
        navigation.push('Profile', { username: username });
      }
    },
    [navigation, track, token.tokenId]
  );

  const handleCreatePost = useCallback(() => {
    if (!token.dbid) return;

    navigation.navigate('PostComposer', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  const creatorUsername =
    token.community?.creator?.__typename === 'GalleryUser' && token.community?.creator?.username;
  const creatorAddress =
    token.community?.creator?.__typename === 'ChainAddress' && token.community?.creator?.address;

  const handleOwnerUsernamePress = useCallback(
    () => handleUsernamePress(token.owner?.username, token.contract?.contractAddress?.address),
    [handleUsernamePress, token.owner?.username, token.contract?.contractAddress?.address]
  );

  const handleCreatorUsernamePress = useCallback(
    () => handleUsernamePress(creatorUsername, creatorAddress),
    [handleUsernamePress, creatorUsername, creatorAddress]
  );

  const CreatorLink = useMemo(() => {
    const creator = token.community?.creator;
    if (token.owner && token.ownerIsCreator) {
      return (
        <GalleryTouchableOpacity
          className="flex flex-row items-center space-x-1"
          onPress={handleOwnerUsernamePress}
          eventElementId="NFT Detail Token Owner Username"
          eventName="NFT Detail Token Owner Username"
          eventContext={contexts['NFT Detail']}
        >
          {token.owner.username && <ProfilePicture userRef={token.owner} size="xs" />}
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {token.owner.username}
          </Typography>
        </GalleryTouchableOpacity>
      );
    } else if (creator?.__typename === 'GalleryUser' && !creator?.universal) {
      return (
        <GalleryTouchableOpacity
          className="flex flex-row items-center space-x-1"
          onPress={handleCreatorUsernamePress}
          eventElementId="NFT Detail Token Owner Username"
          eventName="NFT Detail Token Owner Username"
          eventContext={contexts['NFT Detail']}
        >
          {creator.username && <ProfilePicture userRef={creator} size="xs" />}
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {creator.username}
          </Typography>
        </GalleryTouchableOpacity>
      );
    } else if (token.contract?.creatorAddress?.address) {
      return (
        <View className="flex flex-row items-center space-x-1">
          <RawProfilePicture
            size="xs"
            default
            eventElementId="NftDetail Creator PFP"
            eventName="NftDetail Creator PFP"
            eventContext={contexts['NFT Detail']}
          />
          <LinkableAddress
            textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
            chainAddressRef={token.contract.creatorAddress}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            eventElementId="NFT Detail Creator Address"
            eventName="NFT Detail Creator Address Press"
            eventContext={contexts['NFT Detail']}
          />
        </View>
      );
    }
    return null;
  }, [
    token.owner,
    token.ownerIsCreator,
    token.contract?.creatorAddress,
    token.community?.creator,
    handleOwnerUsernamePress,
    handleCreatorUsernamePress,
    colorScheme,
  ]);

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

  const { contractName } = extractRelevantMetadataFromToken(token);

  return (
    <ScrollView>
      <View className="flex flex-col space-y-3 px-4 pb-4">
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
              eventContext={contexts['NFT Detail']}
              icon={<ShareIcon />}
              onPress={onShare}
            />
          </View>

          <View className="w-full mb-3">
            <TokenFailureBoundary tokenRef={token} variant="large">
              <NftDetailAssetCacheSwapper
                cachedPreviewAssetUrl={route.params.cachedPreviewAssetUrl}
              >
                <NftDetailAsset tokenRef={token} />
              </NftDetailAssetCacheSwapper>
            </TokenFailureBoundary>
          </View>
        </View>

        <View className="flex flex-col space-y-2">
          <Typography
            className="text-2xl"
            font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
          >
            {token.name}
          </Typography>

          <GalleryTouchableOpacity
            eventElementId="NFT Detail Contract Name Pill"
            eventName="NFT Detail Contract Name Pill Clicked"
            eventContext={contexts['NFT Detail']}
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
                eventContext={contexts['NFT Detail']}
              >
                <Typography numberOfLines={1} font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                  {contractName}
                </Typography>
              </GalleryTouchableOpacity>
            </Pill>
          </GalleryTouchableOpacity>
        </View>

        <View className="flex-row">
          {token.owner && (
            <View className="w-1/2 gap-y-1">
              <Typography
                className="text-xs text-shadow dark:text-metal"
                font={{ family: 'ABCDiatype', weight: 'Medium' }}
              >
                OWNER
              </Typography>

              <GalleryTouchableOpacity
                className="flex flex-row items-center space-x-1"
                onPress={handleOwnerUsernamePress}
                eventElementId="NFT Detail Token Owner Username"
                eventName="NFT Detail Token Owner Username"
                eventContext={contexts['NFT Detail']}
              >
                {token.owner.username && <ProfilePicture userRef={token.owner} size="xs" />}

                <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                  {token.owner.username}
                </Typography>
              </GalleryTouchableOpacity>
            </View>
          )}
          {CreatorLink && (
            <View className="w-1/2 gap-y-1">
              <Typography
                className="text-xs text-shadow dark:text-metal"
                font={{ family: 'ABCDiatype', weight: 'Medium' }}
              >
                CREATOR
              </Typography>
              {CreatorLink}
            </View>
          )}
        </View>
        {token.description && (
          <View>
            <Markdown style={markdownStyle}>{token.description}</Markdown>
          </View>
        )}

        {isTokenOwner && (
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
            eventContext={null}
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
