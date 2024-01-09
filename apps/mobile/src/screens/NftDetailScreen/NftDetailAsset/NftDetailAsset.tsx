import { useCallback, useContext, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { NftDetailAssetFragment$key } from '~/generated/NftDetailAssetFragment.graphql';
import { NftDetailAssetCacheSwapperContext } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { NftDetailAssetHtml } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetHtml';
import { NftDetailAssetImage } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetImage';
import { NftDetailAssetVideo } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetVideo';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { useNftDetailAssetSizer } from '~/screens/NftDetailScreen/NftDetailAsset/useNftDetailAssetSizer';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';

type NftDetailProps = {
  tokenRef: NftDetailAssetFragment$key;
  style?: ViewProps['style'];
};

export function NftDetailAsset({ tokenRef, style }: NftDetailProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailAssetFragment on Token {
        dbid
        definition {
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
        }

        ...getPreviewImageUrlsInlineDangerouslyFragment
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

  const { markTokenAsFailed } = useTokenStateManagerContext();
  const handleError = useCallback(() => {
    markTokenAsFailed(
      token.dbid,
      new CouldNotRenderNftError('NftDetailAsset', 'Failed to render', { id: token.dbid })
    );
  }, [markTokenAsFailed, token.dbid]);

  const inner = useMemo(() => {
    if (
      token.definition.media?.__typename === 'GIFMedia' ||
      token.definition.media?.__typename === 'ImageMedia' ||
      token.definition.media?.__typename === 'AudioMedia' ||
      token.definition.media?.__typename === 'InvalidMedia'
    ) {
      const result = getPreviewImageUrlsInlineDangerously({
        tokenRef: token,
        preferStillFrameFromGif: false,
      });

      if (result.type === 'valid' && result.urls.large) {
        return (
          <NftDetailAssetImage
            onLoad={handleLoad}
            onError={handleError}
            imageUrl={result.urls.large}
            outputDimensions={assetSizer.finalAssetDimensions}
          />
        );
      }

      if (result.type === 'error') {
        throw result.error;
      }

      // TODO [GAL-4229] loading view
      return <></>;
    } else if (token.definition.media?.__typename === 'VideoMedia') {
      const videoUrl = token.definition.media.contentRenderURLs?.large;

      if (!videoUrl) {
        throw new CouldNotRenderNftError('NftDetailAsset', 'Video had no contentRenderUrl');
      }

      return (
        <NftDetailAssetVideo
          onLoad={handleLoad}
          onError={handleError}
          videoUrl={videoUrl}
          outputDimensions={assetSizer.finalAssetDimensions}
        />
      );
    } else if (token.definition.media?.__typename === 'HtmlMedia') {
      const htmlUrl = token.definition.media.contentRenderURL;

      if (!htmlUrl) {
        throw new CouldNotRenderNftError(
          'NftDetailAsset',
          'HtmlMedia did not have a contentRenderUrl'
        );
      }

      return <NftDetailAssetHtml htmlUrl={htmlUrl} onLoad={handleLoad} onError={handleError} />;
    }

    throw new CouldNotRenderNftError('NftDetailAsset', 'Unsupported media type', {
      typename: token.definition.media?.__typename,
    });
  }, [assetSizer.finalAssetDimensions, handleError, handleLoad, token]);

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
