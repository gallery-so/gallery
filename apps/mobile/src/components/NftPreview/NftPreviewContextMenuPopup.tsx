import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { PropsWithChildren, useCallback, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { ContextMenuView, OnPressMenuItemEvent } from 'react-native-ios-context-menu';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { Typography } from '~/components/Typography';
import { NftPreviewContextMenuPopupFragment$key } from '~/generated/NftPreviewContextMenuPopupFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { fitDimensionsToContainerCover } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { shareToken } from '../../utils/shareToken';

type NftPreviewContextMenuPopupProps = PropsWithChildren<{
  fallbackTokenUrl?: string;
  imageDimensions: Dimensions | null;
  cachedPreviewAssetUrl: string | null;
  collectionTokenRef: NftPreviewContextMenuPopupFragment$key;
}>;

export function NftPreviewContextMenuPopup({
  children,

  imageDimensions,
  fallbackTokenUrl,
  collectionTokenRef,
  cachedPreviewAssetUrl,
}: NftPreviewContextMenuPopupProps) {
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
          name

          contract {
            name
          }

          media {
            ... on Media {
              previewURLs {
                large
              }
            }
          }

          ...shareTokenFragment
        }
      }
    `,
    collectionTokenRef
  );

  const { token } = collectionToken;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const windowDimensions = useWindowDimensions();

  const tokenUrl = token.media?.previewURLs?.large ?? fallbackTokenUrl;

  const [popupAssetLoaded, setPopupAssetLoaded] = useState(false);

  const handlePopupAssetLoad = useCallback(() => {
    setPopupAssetLoaded(true);
  }, []);

  const handleMenuItemPress = useCallback<OnPressMenuItemEvent>(
    (event) => {
      if (event.nativeEvent.actionKey === 'view-details') {
        navigation.navigate('NftDetail', {
          cachedPreviewAssetUrl,

          tokenId: token.dbid,
          collectionId: collectionToken?.collection?.dbid ?? null,
        });
      } else if (event.nativeEvent.actionKey === 'share') {
        shareToken(token, collectionToken.collection ?? null);
      } else if (event.nativeEvent.actionKey === 'view-gallery') {
        navigation.push('Gallery', {
          galleryId: collectionToken.collection?.gallery?.dbid ?? 'not-found',
        });
      }
    },
    [cachedPreviewAssetUrl, collectionToken.collection, navigation, token]
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
            actionKey: 'view-gallery',
            actionTitle: 'View Gallery',
          },
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
              <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
                <NftPreviewAsset
                  priority="high"
                  tokenUrl={tokenUrl}
                  resizeMode={ResizeMode.CONTAIN}
                  onLoad={handlePopupAssetLoad}
                />
              </ReportingErrorBoundary>

              {popupAssetLoaded ? null : (
                <View className="absolute inset-0">
                  <GallerySkeleton>
                    <SkeletonPlaceholder.Item width="100%" height="100%" />
                  </GallerySkeleton>
                </View>
              )}
            </View>
            <View className="flex flex-col space-y-2 py-4">
              {token.name && (
                <Typography
                  className="px-4 text-2xl"
                  font={{ family: 'GTAlpina', weight: 'Light', italic: true }}
                >
                  {token.name}
                </Typography>
              )}

              {token.contract?.name && (
                <Typography
                  className="text-shadow px-4 text-sm"
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                >
                  {token.contract.name}
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
