import { ResizeMode, Video } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import FastImage, { Priority } from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { GallerySkeleton } from './GallerySkeleton';
import { SvgWebView } from './SvgWebView';

type NftPreviewProps = {
  priority?: Priority;
  tokenRef: NftPreviewFragment$key;
  resizeMode: ResizeMode;
};

function NftPreviewInner({ tokenRef, resizeMode, priority }: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        __typename
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const previews = getVideoOrImageUrlForNftPreview(token);
  const tokenUrl = previews?.urls.medium;

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('NftPreview', 'tokenUrl missing');
  }

  const mediaContent = useMemo(() => {
    if (tokenUrl.includes('svg')) {
      return (
        <SvgWebView
          onLoadEnd={handleLoad}
          source={{
            uri: tokenUrl,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      );
    }

    // Rare case that we didn't processe the NFT correctly
    // and we still have to deal with an image
    // We'll just load the poster and never play the video
    if (tokenUrl.includes('mp4')) {
      return (
        <Video
          onReadyForDisplay={handleLoad}
          shouldPlay
          isLooping
          resizeMode={resizeMode}
          source={{ uri: tokenUrl }}
          className="h-full w-full"
        />
      );
    }

    return (
      <FastImage
        onLoadEnd={handleLoad}
        resizeMode={resizeMode}
        className="h-full w-full overflow-hidden"
        source={{
          headers: { Accepts: 'image/avif;image/png' },
          uri: tokenUrl,
          priority,
        }}
      />
    );
  }, [handleLoad, priority, resizeMode, tokenUrl]);

  return (
    <View className="relative h-full w-full">
      {mediaContent}
      {loaded ? null : (
        <View className="absolute inset-0">
          <GallerySkeleton>
            <SkeletonPlaceholder.Item width="100%" height="100%" />
          </GallerySkeleton>
        </View>
      )}
    </View>
  );
}

export function NftPreview({ tokenRef, resizeMode, priority }: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={null}>
      <NftPreviewInner tokenRef={tokenRef} resizeMode={resizeMode} priority={priority} />
    </ReportingErrorBoundary>
  );
}
