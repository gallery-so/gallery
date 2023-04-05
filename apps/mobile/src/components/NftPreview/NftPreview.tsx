import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import { ContextMenuView } from 'react-native-ios-context-menu';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { Typography } from '~/components/Typography';
import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { fitDimensionsToContainer } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GallerySkeleton } from '../GallerySkeleton';

type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

type NftPreviewProps = {
  priority?: Priority;

  tokenRef: NftPreviewFragment$key;
  tokenUrl: string | null;
  resizeMode: ResizeMode;
};

function NftPreviewInner({ tokenRef, tokenUrl, resizeMode, priority }: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        dbid
        name
        contract {
          name
        }
        owner {
          username
        }
        media {
          ... on Media {
            previewURLs {
              large
            }
          }
        }
      }
    `,
    tokenRef
  );

  const [imageState, setImageState] = useState<ImageState>({ kind: 'loading' });

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('NftPreview', 'tokenUrl missing');
  }

  const navigation = useNavigation<RootStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.push('NftDetail', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  const handleLoad = useCallback((dimensions: Dimensions | null) => {
    setImageState({ kind: 'loaded', dimensions });
  }, []);

  const windowDimensions = useWindowDimensions();

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <ContextMenuView
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
          if (imageState.kind === 'loading') {
            return <View />;
          }

          const MAX_WIDTH = windowDimensions.width - 40;
          const MAX_HEIGHT = 400;

          const finalDimensions = fitDimensionsToContainer({
            container: { height: MAX_HEIGHT, width: MAX_WIDTH },
            source: imageState.dimensions ?? { width: MAX_WIDTH, height: MAX_WIDTH },
          });

          return (
            <View className="bg-white">
              <View className="self-center" style={finalDimensions}>
                <NftPreviewAsset
                  priority="high"
                  resizeMode={ResizeMode.CONTAIN}
                  tokenUrl={token.media?.previewURLs?.large ?? tokenUrl}
                />
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
        <View className="relative h-full w-full">
          <NftPreviewAsset
            tokenUrl={tokenUrl}
            priority={priority}
            resizeMode={resizeMode}
            onLoad={handleLoad}
          />
          {imageState.kind === 'loading' ? (
            <View className="absolute inset-0">
              <GallerySkeleton>
                <SkeletonPlaceholder.Item width="100%" height="100%" />
              </GallerySkeleton>
            </View>
          ) : null}
        </View>
      </ContextMenuView>
    </TouchableWithoutFeedback>
  );
}

export function NftPreview({ tokenRef, tokenUrl, resizeMode, priority }: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={null}>
      <NftPreviewInner
        tokenRef={tokenRef}
        tokenUrl={tokenUrl}
        resizeMode={resizeMode}
        priority={priority}
      />
    </ReportingErrorBoundary>
  );
}
