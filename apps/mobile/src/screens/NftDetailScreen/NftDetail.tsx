import { ResizeMode, Video } from 'expo-av';
import { useMemo, useState } from 'react';
import { useWindowDimensions, View, ViewProps } from 'react-native';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { WebView } from 'react-native-webview';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { NftDetailFragment$key } from '~/generated/NftDetailFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';

import { SvgWebView } from '../../components/SvgWebView';

type NftDetailProps = {
  tokenRef: NftDetailFragment$key;
  style?: ViewProps['style'];
};

function fitDimensionToDimensions(container: Dimension, source: Dimension): Dimension {
  const containerAspectRatio = container.width / container.height;
  const sourceAspectRatio = source.width / source.height;
  let fittedWidth: number;
  let fittedHeight: number;

  if (containerAspectRatio < sourceAspectRatio) {
    // Container is narrower, so fit to width
    fittedWidth = container.width;
    fittedHeight = fittedWidth / sourceAspectRatio;
  } else {
    // Container is shorter, so fit to height
    fittedHeight = container.height;
    fittedWidth = fittedHeight * sourceAspectRatio;
  }

  return {
    width: fittedWidth,
    height: fittedHeight,
  };
}

type Dimension = { width: number; height: number };

export function NftDetail({ tokenRef, style }: NftDetailProps) {
  const token = useFragment(
    graphql`
      fragment NftDetailFragment on Token {
        __typename

        media {
          __typename

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
    `,
    tokenRef
  );

  const windowDimensions = useWindowDimensions();
  const [viewDimensions, setViewDimensions] = useState<Dimension | null>(null);
  const [imageState, setImageState] = useState<
    { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimension | null }
  >({ kind: 'loading' });

  const maxHeight = windowDimensions.height - 200;

  const dimensions = useMemo((): Dimension => {
    if (viewDimensions && imageState.kind === 'loaded' && imageState.dimensions) {
      const result = fitDimensionToDimensions(
        { width: viewDimensions.width, height: maxHeight },
        imageState.dimensions
      );

      return result;
    }

    return { width: 300, height: 300 };
  }, [imageState, maxHeight, viewDimensions]);

  const inner = useMemo(() => {
    if (!token.media) {
      throw new CouldNotRenderNftError('NftDetail', 'Token media did not exist');
    }

    if (token.media.__typename === 'GIFMedia' || token.media.__typename === 'ImageMedia') {
      const imageUrl = token.media.previewURLs?.large;
      if (!imageUrl) {
        throw new CouldNotRenderNftError('NftDetail', 'Image had no contentRenderUrl');
      }

      if (imageUrl.includes('.svg')) {
        return (
          <SvgWebView
            onLoadEnd={() => {
              setImageState({ kind: 'loaded', dimensions: null });
            }}
            source={{ uri: imageUrl }}
            style={{ width: viewDimensions?.width, height: viewDimensions?.height }}
          />
        );
      }

      return (
        <FastImage
          style={{ ...dimensions }}
          onLoad={(event) => {
            setImageState({ kind: 'loaded', dimensions: event.nativeEvent });
          }}
          resizeMode={ResizeMode.CONTAIN}
          source={{ uri: imageUrl, priority: FastImage.priority.high }}
        />
      );
    } else if (token.media.__typename === 'VideoMedia') {
      if (!token.media.contentRenderURLs?.large) {
        throw new CouldNotRenderNftError('NftDetail', 'Video had no contentRenderUrl');
      }

      return (
        <Video
          style={{ ...dimensions }}
          onReadyForDisplay={(event) => {
            setImageState({ kind: 'loaded', dimensions: event.naturalSize });
          }}
          shouldPlay
          isLooping
          resizeMode={ResizeMode.CONTAIN}
          source={{
            uri: token.media.contentRenderURLs.large,

            headers: { Accepts: 'image/avif;image/png' },
          }}
        />
      );
    } else if (token.media.__typename === 'HtmlMedia') {
      if (!token.media.contentRenderURL) {
        throw new CouldNotRenderNftError('NftDetail', 'HtmlMedia did not have a contentRenderUrl');
      }

      return (
        <View style={{ width: viewDimensions?.width, height: viewDimensions?.width }}>
          <WebView
            onLoadEnd={() => {
              setImageState({ kind: 'loaded', dimensions: null });
            }}
            originWhitelist={['*']}
            className="h-full w-full bg-transparent"
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            source={{ uri: token.media.contentRenderURL }}
          />
        </View>
      );
    }
  }, [dimensions, token.media, viewDimensions?.height, viewDimensions?.width]);

  return (
    <View
      style={style}
      className="relative"
      onLayout={(event) => {
        setViewDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        });
      }}
    >
      {inner}
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
