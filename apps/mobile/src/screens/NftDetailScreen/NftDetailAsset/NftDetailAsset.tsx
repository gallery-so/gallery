import { useCallback, useContext, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { NftDetailAssetCacheSwapperContext } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { NftDetailAssetHtml } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetHtml';
import { NftDetailAssetImage } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetImage';
import { NftDetailAssetVideo } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetVideo';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { useNftDetailAssetSizer } from '~/screens/NftDetailScreen/NftDetailAsset/useNftDetailAssetSizer';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

type NftDetailProps = {
  tokenRef: NftDetailAssetFragment$key;
  style?: ViewProps['style'];
};

export function NftDetailAsset({ tokenRef, style }: NftDetailProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetFragment on Token {
        media {
          __typename

          ... on InvalidMedia {
            __typename
          }

          ... on AudioMedia {
            __typename
          }

          ... on GIFMedia {
            __typename
          }
          ... on ImageMedia {
            __typename
          }

          ... on HtmlMedia {
            contentRenderURL
          }

          ... on VideoMedia {
            __typename
            contentRenderURLs {
              large
            }
          }
        }

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const assetSizer = useNftDetailAssetSizer();

  const cachedAssetSwapperContext = useContext(NftDetailAssetCacheSwapperContext);
  const handleLoad = useCallback(
    (dimensions?: Dimensions | null) => {
      cachedAssetSwapperContext?.markDetailAssetAsLoaded();

      assetSizer.handleLoad(dimensions);
    },
    [assetSizer, cachedAssetSwapperContext]
  );

  const inner = useMemo(() => {
    if (
      token.media?.__typename === 'GIFMedia' ||
      token.media?.__typename === 'ImageMedia' ||
      token.media?.__typename === 'AudioMedia' ||
      token.media?.__typename === 'InvalidMedia'
    ) {
      const imageUrl = getVideoOrImageUrlForNftPreview({
        tokenRef: token,
        preferStillFrameFromGif: false,
      })?.urls.large;

      if (!imageUrl) {
        throw new CouldNotRenderNftError('NftDetailAsset', 'Image had no contentRenderUrl');
      }

      return (
        <NftDetailAssetImage
          onLoad={handleLoad}
          imageUrl={imageUrl}
          outputDimensions={assetSizer.finalAssetDimensions}
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
          outputDimensions={assetSizer.finalAssetDimensions}
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
  }, [assetSizer.finalAssetDimensions, handleLoad, token]);

  return (
    <View
      style={style}
      className="relative flex flex-row justify-center"
      onLayout={assetSizer.handleViewLayout}
    >
      {inner}
    </View>
  );
}
