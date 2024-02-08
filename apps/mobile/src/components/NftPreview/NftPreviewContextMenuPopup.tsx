import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { PropsWithChildren, useCallback, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { ContextMenuView, OnPressMenuItemEvent } from 'react-native-ios-context-menu';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useToggleTokenAdmire } from 'src/hooks/useToggleTokenAdmire';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { Typography } from '~/components/Typography';
import { NftPreviewContextMenuPopupFragment$key } from '~/generated/NftPreviewContextMenuPopupFragment.graphql';
import { NftPreviewContextMenuPopupQueryFragment$key } from '~/generated/NftPreviewContextMenuPopupQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { fitDimensionsToContainerCover } from '~/shared/utils/fitDimensionsToContainer';

import { shareToken } from '../../utils/shareToken';
import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';

type NftPreviewContextMenuPopupProps = PropsWithChildren<{
  queryRef: NftPreviewContextMenuPopupQueryFragment$key;
  collectionTokenRef: NftPreviewContextMenuPopupFragment$key;
  imageDimensions: Dimensions | null;
  fallbackTokenUrl: string;
}>;

const ENABLED_ARTIST = false;

export function NftPreviewContextMenuPopup({
  queryRef,
  collectionTokenRef,
  imageDimensions,
  fallbackTokenUrl,
  children,
}: NftPreviewContextMenuPopupProps) {
  const query = useFragment(
    graphql`
      fragment NftPreviewContextMenuPopupQueryFragment on Query {
        ...useToggleTokenAdmireQueryFragment
      }
    `,
    queryRef
  );
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewContextMenuPopupFragment on CollectionToken {
        collection {
          dbid
          gallery {
            dbid
          }

          ...shareTokenCollectionFragment
        }

        token @required(action: THROW) {
          dbid
          definition {
            name
            community {
              name
            }
            media {
              ... on Media {
                previewURLs {
                  large
                }
              }
            }
          }

          ...shareTokenFragment
          ...TokenFailureBoundaryFragment
          ...useToggleTokenAdmireFragment
        }
      }
    `,
    collectionTokenRef
  );

  const { token } = collectionToken;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const windowDimensions = useWindowDimensions();

  const tokenUrl = token.definition?.media?.previewURLs?.large ?? fallbackTokenUrl;

  const [popupAssetLoaded, setPopupAssetLoaded] = useState(false);

  const handlePopupAssetLoad = useCallback(() => {
    setPopupAssetLoaded(true);
  }, []);

  const { hasViewerAdmiredEvent, toggleTokenAdmire: toggleTokenBookmark } = useToggleTokenAdmire({
    tokenRef: token,
    queryRef: query,
  });

  const handleMenuItemPress = useCallback<OnPressMenuItemEvent>(
    (event) => {
      if (event.nativeEvent.actionKey === 'view-details') {
        navigation.navigate('NftDetail', {
          cachedPreviewAssetUrl: fallbackTokenUrl,
          tokenId: token.dbid,
          collectionId: collectionToken?.collection?.dbid ?? null,
        });
      } else if (event.nativeEvent.actionKey === 'share') {
        shareToken(token, collectionToken.collection ?? null);
      } else if (event.nativeEvent.actionKey === 'view-gallery') {
        navigation.push('Gallery', {
          galleryId: collectionToken.collection?.gallery?.dbid ?? 'not-found',
        });
      } else if (event.nativeEvent.actionKey === 'bookmark') {
        toggleTokenBookmark();
      }
      // else if (event.nativeEvent.actionKey === 'view-artist') {
      //   navigation.push('Profile', {
      //     username: collectionToken.collection?.owner?.username ?? 'not-found',
      //   });
      // }
    },
    [collectionToken.collection, fallbackTokenUrl, navigation, token]
  );

  const track = useTrack();

  return (
    <ContextMenuView
      // If we don't have a tokenUrl, we should bail
      isContextMenuEnabled={Boolean(tokenUrl)}
      onPressMenuItem={handleMenuItemPress}
      onMenuDidShow={() => {
        track('NFT Preview Long Press Popup');
      }}
      menuConfig={{
        menuTitle: '',
        menuItems: [
          {
            actionKey: 'view-details',
            actionTitle: 'View Details',
          },
          {
            actionKey: 'bookmark',
            actionTitle: hasViewerAdmiredEvent ? 'Remove from Bookmarks' : 'Add to Bookmarks',
          },
          {
            actionKey: 'view-gallery',
            actionTitle: 'View Gallery',
          },
          // {
          //   actionKey: 'view-artist',
          //   actionTitle: 'View Artist',
          // },
          {
            actionKey: 'share',
            actionTitle: 'Share',
          },
        ],
      }}
      previewConfig={{
        previewType: 'CUSTOM',
        previewSize: 'INHERIT',
      }}
      renderPreview={() => {
        if (!tokenUrl) {
          throw new Error("NftPreviewContextMenu shown without a tokenUrl. This shouldn't happen.");
        }

        const MAX_WIDTH = windowDimensions.width - 40;

        // 400px seems to be the right number to make the popup look good on all devices
        // It's not as simple as screen height - (non image part of view) because the popup
        // doesn't go all the way to the top of the screen.
        const MAX_HEIGHT = Math.max(0, windowDimensions.height - 400);

        const finalDimensions = fitDimensionsToContainerCover({
          container: { width: MAX_WIDTH, height: MAX_HEIGHT },
          source: imageDimensions ?? { width: MAX_WIDTH, height: MAX_WIDTH }, // Square aspect ratio fallback
        });

        return (
          <View className="bg-white dark:bg-black-900">
            <View className="self-center" style={finalDimensions}>
              <TokenFailureBoundary tokenRef={token} variant="large">
                <RawNftPreviewAsset
                  priority="high"
                  tokenUrl={tokenUrl}
                  resizeMode={ResizeMode.CONTAIN}
                  onLoad={handlePopupAssetLoad}
                />
              </TokenFailureBoundary>

              {popupAssetLoaded ? null : (
                <View className="absolute inset-0">
                  <GallerySkeleton>
                    <SkeletonPlaceholder.Item width="100%" height="100%" />
                  </GallerySkeleton>
                </View>
              )}
            </View>
            <View className="flex flex-col py-3 px-4 bg-black/90">
              {token.definition?.name && (
                <Typography
                  className="text-offWhite"
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                >
                  {token.definition.name}
                </Typography>
              )}

              {token.definition?.community?.name && (
                <Typography
                  font={{
                    family: 'ABCDiatype',
                    weight: 'Regular',
                  }}
                  className="text-sm"
                >
                  <Text className="text-porcelain">{token.definition.community.name}</Text>
                  {ENABLED_ARTIST && <Text className="text-metal"> by riley.eth</Text>}
                </Typography>
              )}
            </View>
          </View>
        );
      }}
    >
      {children}
    </ContextMenuView>
  );
}
