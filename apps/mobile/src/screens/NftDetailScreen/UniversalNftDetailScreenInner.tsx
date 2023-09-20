import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ShareIcon } from 'src/icons/ShareIcon';
import { shareUniversalToken } from 'src/utils/shareToken';

import { BackButton } from '~/components/BackButton';
import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { IconContainer } from '~/components/IconContainer';
import { Pill } from '~/components/Pill';
import { UniversalNftDetailScreenInnerQuery } from '~/generated/UniversalNftDetailScreenInnerQuery.graphql';
import { MainTabStackNavigatorParamList, MainTabStackNavigatorProp } from '~/navigation/types';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { InteractiveLink } from '../../components/InteractiveLink';
import { Markdown } from '../../components/Markdown';
import { Typography } from '../../components/Typography';
import { PoapIcon } from '../../icons/PoapIcon';
import { NftAdditionalDetails } from './NftAdditionalDetails';
import { NftDetailAsset } from './NftDetailAsset/NftDetailAsset';

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
  },
});

const ENABLED_CREATOR = false;

// TODO: Refactor this to merge with existing NftDetailScreen

export function UniversalNftDetailScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useLazyLoadQuery<UniversalNftDetailScreenInnerQuery>(
    graphql`
      query UniversalNftDetailScreenInnerQuery($tokenId: DBID!) {
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
            ownerIsCreator
            owner {
              username
            }

            ...NftAdditionalDetailsFragment
            ...NftDetailAssetFragment
            ...shareTokenUniversalFragment
            ...TokenFailureBoundaryFragment
          }
        }
      }
    `,
    {
      tokenId: route.params.tokenId,
    }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

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

  const handleShare = useCallback(() => {
    shareUniversalToken(token);
  }, [token]);

  return (
    <ScrollView>
      <View className="flex flex-col space-y-6 px-4 pb-4">
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

          <View className="w-full">
            <TokenFailureBoundary tokenRef={token} variant="large">
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
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                {token.ownerIsCreator ? 'CREATOR' : 'OWNER'}
              </Typography>

              <InteractiveLink onPress={handleUsernamePress} type="NFT Detail Token Owner Username">
                {token.owner.username}
              </InteractiveLink>
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

        <View className="flex-1">
          <NftAdditionalDetails tokenRef={token} />
        </View>
      </View>
    </ScrollView>
  );
}
