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
import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import {
  CreatorProfilePictureAndUsernameOrAddress,
  OwnerProfilePictureAndUsername,
} from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { Typography } from '~/components/Typography';
import { NftDetailSectionQueryFragment$key } from '~/generated/NftDetailSectionQueryFragment.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import TokenViewEmitter from '~/shared/components/TokenViewEmitter';
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
              contractAddress {
                address
                chain
              }
            }
            owner {
              id
              username
              ...ProfilePictureAndUserOrAddressOwnerFragment
            }
            community {
              creator {
                ...ProfilePictureAndUserOrAddressCreatorFragment
                ... on GalleryUser {
                  username
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

  const handleCreatePost = useCallback(() => {
    if (!token.dbid) return;

    navigation.navigate('PostComposer', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  const handleOwnerUsernamePress = useCallback(() => {
    if (token.owner?.username) {
      navigation.push('Profile', { username: token.owner.username });
    }
  }, [navigation, token.owner?.username]);

  const handleCreatorUsernamePress = useCallback(() => {
    if (token.community?.creator?.username) {
      navigation.push('Profile', { username: token.community?.creator?.username ?? '' });
    }
  }, [token.community?.creator?.username, navigation]);

  const CreatorComponent = useMemo(() => {
    if (token.community?.creator) {
      return (
        <CreatorProfilePictureAndUsernameOrAddress
          userOrAddressRef={token.community.creator}
          handlePress={handleCreatorUsernamePress}
          eventContext={contexts['NFT Detail']}
        />
      );
    }

    return null;
  }, [
    token.community?.creator,
    handleCreatorUsernamePress,
  ]);

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

              <View>
                <OwnerProfilePictureAndUsername
                  userRef={token.owner}
                  handlePress={handleOwnerUsernamePress}
                  eventContext={contexts['NFT Detail']}
                />
              </View>
            </View>
          )}
          {CreatorComponent && (
            <View className="w-1/2 gap-y-1">
              <Typography
                className="text-xs text-shadow dark:text-metal"
                font={{ family: 'ABCDiatype', weight: 'Medium' }}
              >
                CREATOR
              </Typography>

              <View>{CreatorComponent}</View>
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
