import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, useWindowDimensions, View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { fitDimensionsToContainerCover } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { NftDetailAssetHtml } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetHtml';
import { NftDetailAssetImage } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetImage';
import { NftDetailAssetVideo } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetVideo';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';

type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

type NftDetailProps = {
  collectionTokenRef: NftDetailAssetFragment$key;
  style?: ViewProps['style'];
};

export function NftDetailAsset({ collectionTokenRef, style }: NftDetailProps) {
  const collectionToken = useFragment(
    graphql`
      fragment NftDetailAssetFragment on CollectionToken {
        token @required(action: THROW) {
          media {
            __typename

            ... on AudioMedia {
              previewURLs {
                large
              }
            }

            ... on VideoMedia {
              __typename
              contentRenderURLs {
                large
              }
            }
            ... on GIFMedia {
              __typename
              previewURLs {
                large
              }
            }
            ... on ImageMedia {
              __typename
              previewURLs {
                large
              }
            }

            ... on HtmlMedia {
              contentRenderURL
            }
          }
        }
      }
    `,
    collectionTokenRef
  );

  const { token } = collectionToken;

  const windowDimensions = useWindowDimensions();

  const [imageState, setImageState] = useState<ImageState>({ kind: 'loading' });
  const [viewDimensions, setViewDimensions] = useState<Dimensions | null>(null);

  const handleViewLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setViewDimensions({ width, height });
  }, []);

  const handleLoad = useCallback((dimensions?: Dimensions | null) => {
    setImageState({ kind: 'loaded', dimensions: dimensions ?? null });
  }, []);

  const finalAssetDimensions = useMemo((): Dimensions => {
    if (viewDimensions && imageState.kind === 'loaded' && imageState.dimensions) {
      // Give the piece a little bit of breathing room. This might be an issue
      // if we evers upport landscape view (turning your phone horizontally).
      const MAX_HEIGHT = windowDimensions.height - 200;

      // Width is the width of the parent view (the screen - some padding)
      // Height is the max height for the image
      //
      // This will fit the image to the screen appropriately.
      const containerDimensions: Dimensions = { width: viewDimensions.width, height: MAX_HEIGHT };

      return fitDimensionsToContainerCover({
        container: containerDimensions,
        source: imageState.dimensions,
      });
    }

    // This is a fallback for when we don't have the image dimensions yet.
    // The user will never see the image in this state since it will be covered
    // by a loading skeleton UI anyway.
    return { width: 300, height: 300 };
  }, [imageState, viewDimensions, windowDimensions.height]);

  const inner = useMemo(() => {
    if (
      token.media?.__typename === 'GIFMedia' ||
      token.media?.__typename === 'ImageMedia' ||
      token.media?.__typename === 'AudioMedia'
    ) {
      const imageUrl = token.media.previewURLs?.large;

      if (!imageUrl) {
        throw new CouldNotRenderNftError('NftDetailAsset', 'Image had no contentRenderUrl');
      }

      return (
        <NftDetailAssetImage
          onLoad={handleLoad}
          imageUrl={imageUrl}
          outputDimensions={finalAssetDimensions}
        />
      );
    } else if (token.media?.__typename === 'VideoMedia') {
      const videoUrl = token.media.contentRenderURLs?.large;

      if (!videoUrl) {
        throw new CouldNotRenderNftError('NftDetailAsset', 'Video had no contentRenderUrl');
      }

      return (
        <NftDetailAssetVideo
          onLoad={handleLoad}
          videoUrl={videoUrl}
          outputDimensions={finalAssetDimensions}
        />
      );
    } else if (token.media?.__typename === 'HtmlMedia') {
      const htmlUrl = token.media.contentRenderURL;

      if (!htmlUrl) {
        throw new CouldNotRenderNftError(
          'NftDetailAsset',
          'HtmlMedia did not have a contentRenderUrl'
        );
      }

      return <NftDetailAssetHtml htmlUrl={htmlUrl} onLoad={handleLoad} />;
    }

    throw new CouldNotRenderNftError('NftDetailAsset', 'Unsupported media type', {
      typename: token.media?.__typename,
    });
  }, [finalAssetDimensions, handleLoad, token.media]);

  return (
    <View style={style} className="relative" onLayout={handleViewLayout}>
      {inner}

      {/* Show a skeleton placeholder over the image while it's loading */}
      {imageState.kind === 'loading' && (
        <View className="absolute">
          <GallerySkeleton>
            <SkeletonPlaceholder.Item
              width={viewDimensions?.width}
              height={viewDimensions?.height}
            />
          </GallerySkeleton>
        </View>
      )}
    </View>
  );
}
