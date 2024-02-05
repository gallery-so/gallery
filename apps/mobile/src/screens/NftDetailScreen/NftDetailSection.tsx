import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';
import { useToggleTokenAdmire } from 'src/hooks/useToggleTokenAdmire';
import { BookmarkIcon } from 'src/icons/BookmarkIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { ShareIcon } from 'src/icons/ShareIcon';

import { BackButton } from '~/components/BackButton';
import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { MintLinkButton } from '~/components/MintLinkButton';
import { Pill } from '~/components/Pill';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
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

export function NftDetailSection({ onShare, queryRef }: Props) {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useFragment(
    graphql`
      fragment NftDetailSectionQueryFragment on Query {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            dbid
            definition {
              name
              chain
              tokenId
              description
              community {
                name
                badgeURL
                creator {
                  ...ProfilePictureAndUserOrAddressCreatorFragment
                  ... on GalleryUser {
                    username
                  }
                }
                ...useNavigateToCommunityScreenFragment
              }
            }

            owner {
              id
              username
              primaryWallet {
                chainAddress {
                  address
                }
              }
              ...ProfilePictureAndUserOrAddressOwnerFragment
            }

            ...NftAdditionalDetailsFragment
            ...NftDetailAssetFragment
            ...TokenFailureBoundaryFragment
            ...extractRelevantMetadataFromTokenFragment
            ...useToggleTokenAdmireFragment
            ...MintLinkButtonFragment
          }
        }
        ...useLoggedInUserIdFragment
        ...useToggleTokenAdmireQueryFragment
      }
    `,
    queryRef
  );

  const { colorScheme } = useColorScheme();

  const token = query.tokenById;
  const ownerWalletAddress =
    token?.__typename === 'Token' ? token.owner?.primaryWallet?.chainAddress?.address ?? '' : '';

  const loggedInUserId = useLoggedInUserId(query);

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const { definition: tokenDefinition } = token;

  const isTokenOwner = loggedInUserId === token.owner?.id;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const navigateToCommunity = useNavigateToCommunityScreen();

  const handleNavigateToCommunityScreen = useCallback(() => {
    if (tokenDefinition?.community) {
      navigateToCommunity(tokenDefinition.community);
    }
  }, [navigateToCommunity, tokenDefinition.community]);

  const handleCreatePost = useCallback(() => {
    if (token.dbid) {
      navigation.navigate('PostComposer', {
        tokenId: token.dbid,
      });
    }
  }, [navigation, token.dbid]);

  const handleOwnerUsernamePress = useCallback(() => {
    if (token.owner?.username) {
      navigation.push('Profile', { username: token.owner.username });
    }
  }, [navigation, token.owner?.username]);

  const handleCreatorUsernamePress = useCallback(() => {
    if (tokenDefinition?.community?.creator?.username) {
      navigation.push('Profile', { username: tokenDefinition.community.creator.username ?? '' });
    }
  }, [tokenDefinition?.community?.creator?.username, navigation]);

  const CreatorComponent = useMemo(() => {
    if (tokenDefinition?.community?.creator) {
      return (
        <CreatorProfilePictureAndUsernameOrAddress
          userOrAddressRef={tokenDefinition.community.creator}
          handlePress={handleCreatorUsernamePress}
          eventContext={contexts['NFT Detail']}
        />
      );
    }

    return null;
  }, [tokenDefinition?.community?.creator, handleCreatorUsernamePress]);

  const {
    hasViewerAdmiredEvent: hasViewerBookmarkedEvent,
    toggleTokenAdmire: toggleTokenBookmark,
  } = useToggleTokenAdmire({
    tokenRef: token,
    queryRef: query,
  });

  const { contractName } = extractRelevantMetadataFromToken(token);

  const blueToDisplay = useMemo(
    () => (colorScheme === 'dark' ? '[#7597FF]' : 'activeBlue'),
    [colorScheme]
  );

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
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View className="max-w-[70%]">
              <Typography
                className="text-2xl"
                font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
              >
                {tokenDefinition.name}
              </Typography>
            </View>
          </View>
          <GalleryTouchableOpacity
            eventElementId="NFT Detail Contract Name Pill"
            eventName="NFT Detail Contract Name Pill Clicked"
            eventContext={contexts['NFT Detail']}
          >
            <Pill className="flex flex-row space-x-1 self-start">
              {tokenDefinition.chain === 'POAP' && <PoapIcon className="h-6 w-6" />}
              {tokenDefinition.community?.badgeURL && (
                <FastImage
                  className="h-6 w-6"
                  source={{ uri: tokenDefinition.community.badgeURL }}
                />
              )}
              <GalleryTouchableOpacity
                onPress={handleNavigateToCommunityScreen}
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
        {tokenDefinition?.description && (
          <View>
            <ProcessedText text={tokenDefinition.description} />
          </View>
        )}

        <View className="space-y-2">
          <Button
            variant="blue"
            headerElement={<BookmarkIcon active={hasViewerBookmarkedEvent} />}
            eventElementId={'NFT Detail Token Bookmark Button'}
            eventName={'NFT Detail Token Bookmark Button Clicked'}
            eventContext={contexts['NFT Detail']}
            onPress={toggleTokenBookmark}
            text={hasViewerBookmarkedEvent ? 'bookmarked' : 'bookmark'}
            textClassName={hasViewerBookmarkedEvent ? `text-${blueToDisplay}` : ''}
            containerClassName={
              hasViewerBookmarkedEvent ? 'border border-[#7597FF]' : 'border border-porcelain'
            }
          />
        </View>

        {isTokenOwner ? (
          <Button
            headerElement={
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
        ) : (
          <MintLinkButton
            tokenRef={token}
            eventContext={contexts['NFT Detail']}
            referrerAddress={ownerWalletAddress}
          />
        )}

        <View className="flex-1">
          <NftAdditionalDetails tokenRef={token} />
        </View>
      </View>
    </ScrollView>
  );
}
