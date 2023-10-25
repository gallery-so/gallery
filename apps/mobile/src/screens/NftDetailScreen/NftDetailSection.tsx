import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';
import { useToggleTokenAdmire } from 'src/hooks/useToggleTokenAdmire';
import { PoapIcon } from 'src/icons/PoapIcon';
import { ShareIcon } from 'src/icons/ShareIcon';

import { BackButton } from '~/components/BackButton';
import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { Button } from '~/components/Button';
import { AdmireIcon } from '~/components/Feed/Socialize/AdmireIcon';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryLink } from '~/components/GalleryLink';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { Markdown } from '~/components/Markdown';
import { Pill } from '~/components/Pill';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
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

import { AdmireBottomSheet } from './AdmireBottomSheet';
import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetailAsset } from './NftDetailAsset/NftDetailAsset';
import { NftDetailAssetCacheSwapper } from './NftDetailAsset/NftDetailAssetCacheSwapper';

type Props = {
  onShare: () => void;
  queryRef: NftDetailSectionQueryFragment$key;
};

const ENABLED_CREATOR = false;

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

            # We only show 1 but in case the user deletes something
            # we want to be sure that we can show another admire beneath
            admires(last: 5) @connection(key: "Interactions_token_admires") {
              pageInfo {
                total
              }
              edges {
                node {
                  dbid
                  __typename
                  admirer {
                    username
                    ...ProfileViewSharedFollowersBubblesFragment
                  }
                }
              }
            }

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
            ...TokenFailureBoundaryFragment
            ...extractRelevantMetadataFromTokenFragment
            ...useToggleTokenAdmireFragment
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

  const { hasViewerAdmiredEvent, toggleTokenAdmire } = useToggleTokenAdmire({
    tokenRef: token,
    queryRef: query,
  });

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of token.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [token.admires?.edges]);

  const admireUsers = useMemo(() => {
    const users = [];
    for (const admire of nonNullAdmires) {
      if (admire?.admirer) {
        users.push(admire.admirer);
      }
    }
    return users;
  }, [nonNullAdmires]);

  const totalAdmires = token.admires?.pageInfo?.total ?? 0;
  const admiresBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSeeAllAdmires = useCallback(() => {
    admiresBottomSheetRef.current?.present();
  }, []);

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
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography
              className="text-2xl"
              font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
            >
              {token.name}
            </Typography>
            <View className="flex flex-row space-x-2 items-center">
              {admireUsers.length > 0 && (
                <ProfilePictureBubblesWithCount
                  eventName="Nft Detail Screen Admire Bubbles Pressed"
                  eventElementId="Nft Detail Screen Admire Bubbles"
                  eventContext={contexts['NFT Detail']}
                  onPress={handleSeeAllAdmires}
                  userRefs={admireUsers}
                  totalCount={totalAdmires}
                />
              )}
              <GalleryTouchableOpacity
                eventElementId={'NFT Detail Token Admire'}
                eventName={'NFT Detail Token Admire Clicked'}
                eventContext={contexts['NFT Detail']}
                onPress={toggleTokenAdmire}
              >
                <AdmireIcon active={hasViewerAdmiredEvent} />
              </GalleryTouchableOpacity>
            </View>
          </View>
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
                {token.ownerIsCreator ? 'CREATOR' : 'OWNER'}
              </Typography>

              <GalleryTouchableOpacity
                className="flex flex-row items-center space-x-1"
                onPress={handleUsernamePress}
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
          {ENABLED_CREATOR && (
            <View className="w-1/2">
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                CREATOR
              </Typography>

              <GalleryLink
                onPress={handleUsernamePress}
                // TODO analytics whenever we enable this component
                eventElementId={null}
                eventName={null}
                eventContext={null}
              >
                riley.eth
              </GalleryLink>
              <GalleryLink
                onPress={handleUsernamePress}
                // TODO analytics whenever we enable this component
                eventElementId={null}
                eventName={null}
                eventContext={null}
              >
                riley.eth
              </GalleryLink>
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

        <Button
          className={hasViewerAdmiredEvent ? 'border border-[#001CC1]' : 'border border-faint'}
          variant="blue"
          icon={<AdmireIcon active={hasViewerAdmiredEvent} />}
          eventElementId={'NFT Detail Token Admire'}
          eventName={'NFT Detail Token Admire Clicked'}
          eventContext={contexts['NFT Detail']}
          onPress={toggleTokenAdmire}
          text="admire"
        />

        <View className="flex-1">
          <NftAdditionalDetails tokenRef={token} />
        </View>
      </View>

      <AdmireBottomSheet tokenId={token.dbid ?? ''} bottomSheetRef={admiresBottomSheetRef} />
    </ScrollView>
  );
}
