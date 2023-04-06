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
import { Typography } from '~/components/Typography';
import { NftPreviewContextMenuPopupFragment$key } from '~/generated/NftPreviewContextMenuPopupFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { fitDimensionsToContainer } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

import { shareToken } from '../../utils/shareToken';

type NftPreviewContextMenuPopupProps = PropsWithChildren<{
  fallbackTokenUrl?: string;
  imageDimensions: Dimensions | null;
  tokenRef: NftPreviewContextMenuPopupFragment$key;
}>;

export function NftPreviewContextMenuPopup({
  imageDimensions,
  fallbackTokenUrl,
  tokenRef,
  children,
}: NftPreviewContextMenuPopupProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewContextMenuPopupFragment on Token {
        __typename

        dbid
        name

        owner {
          username
        }

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
    `,
    tokenRef
  );

  const navigation = useNavigation<RootStackNavigatorProp>();
  const windowDimensions = useWindowDimensions();

  const tokenUrl = token.media?.previewURLs?.large ?? fallbackTokenUrl;

  const [popupAssetLoaded, setPopupAssetLoaded] = useState(false);

  const handlePopupAssetLoad = useCallback(() => {
    setPopupAssetLoaded(true);
  }, []);

  const handleMenuItemPress = useCallback<OnPressMenuItemEvent>(
    (event) => {
      if (event.nativeEvent.actionKey === 'view-details') {
        navigation.navigate('NftDetail', { tokenId: token.dbid });
      } else if (event.nativeEvent.actionKey === 'share') {
        shareToken(token);
      }
    },
    [navigation, token]
  );

  return (
    <ContextMenuView
      // If we don't have a tokenUrl, we should bail
      isContextMenuEnabled={Boolean(tokenUrl)}
      onPressMenuItem={handleMenuItemPress}
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
        const MAX_HEIGHT = 400;

        const finalDimensions = fitDimensionsToContainer({
          container: { height: MAX_HEIGHT, width: MAX_WIDTH },
          source: imageDimensions ?? { width: MAX_WIDTH, height: MAX_WIDTH },
        });

        return (
          <View className="bg-white">
            <View className="self-center" style={finalDimensions}>
              <NftPreviewAsset
                priority="high"
                tokenUrl={tokenUrl}
                resizeMode={ResizeMode.CONTAIN}
                onLoad={handlePopupAssetLoad}
              />

              {popupAssetLoaded ? null : (
                <View className="absolute inset-0">
                  <GallerySkeleton>
                    <SkeletonPlaceholder.Item width="100%" height="100%" />
                  </GallerySkeleton>
                </View>
              )}
            </View>
            <View className="flex flex-col space-y-2 p-4">
              <Typography
                className="text-2xl"
                font={{ family: 'GTAlpina', weight: 'Light', italic: true }}
              >
                {token.name}
              </Typography>
              <View className="flex flex-row space-x-2">
                {token.owner?.username && (
                  <View className="flex-1 flex-col">
                    <Typography
                      className="text-xs"
                      font={{ family: 'ABCDiatype', weight: 'Medium' }}
                    >
                      CREATED BY
                    </Typography>

                    <Typography
                      className="text-shadow text-sm"
                      font={{ family: 'ABCDiatype', weight: 'Regular' }}
                    >
                      {token.owner.username}
                    </Typography>
                  </View>
                )}
                {token.contract?.name && (
                  <View className="flex-1">
                    <Typography
                      className="text-xs"
                      font={{ family: 'ABCDiatype', weight: 'Medium' }}
                    >
                      COMMUNITY
                    </Typography>

                    <Typography
                      className="text-shadow text-sm"
                      font={{ family: 'ABCDiatype', weight: 'Regular' }}
                    >
                      {token.contract.name}
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      }}
    >
      {children}
    </ContextMenuView>
  );
}
