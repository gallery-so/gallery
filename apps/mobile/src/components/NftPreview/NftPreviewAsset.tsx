import { ResizeMode, Video } from 'expo-av';
import { memo, useCallback } from 'react';
import FastImage, { Priority } from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { SvgWebView } from '~/components/SvgWebView';
import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { NftPreviewAssetToWrapInBoundaryFragment$key } from '~/generated/NftPreviewAssetToWrapInBoundaryFragment.graphql';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import {
  useGetSinglePreviewImage,
  useGetSinglePreviewImageProps,
} from '~/shared/relay/useGetPreviewImages';

type RawNftPreviewAssetProps = {
  tokenUrl: string;
  priority?: Priority;
  resizeMode: ResizeMode;
  onLoad?: (dimensions: Dimensions | null) => void;
  onError?: () => void;
};

function RawNftPreviewAsset({
  tokenUrl,
  onLoad,
  onError = () => {},
  priority,
  resizeMode,
}: RawNftPreviewAssetProps) {
  if (tokenUrl.includes('svg')) {
    return (
      <SvgWebView
        onLoadEnd={(dimensions) => {
          onLoad?.(dimensions);
        }}
        onError={onError}
        source={{
          uri: tokenUrl,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  // Rare case that we didn't process the NFT correctly
  // and we still have to deal with an image
  // We'll just load the poster and never play the video
  if (tokenUrl.includes('mp4')) {
    return (
      <Video
        onReadyForDisplay={(event) => {
          onLoad?.(event.naturalSize);
        }}
        onError={onError}
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
      onLoad={(event) => {
        onLoad?.(event.nativeEvent);
      }}
      onError={onError}
      resizeMode={resizeMode}
      className="h-full w-full overflow-hidden"
      source={{
        headers: { Accepts: 'image/avif;image/png' },
        uri: tokenUrl,
        priority,
      }}
    />
  );
}

const MemoizedNftPreviewAsset = memo(RawNftPreviewAsset);

type NftPreviewAssetToWrapInBoundaryProps = {
  tokenRef: NftPreviewAssetToWrapInBoundaryFragment$key;
  mediaSize: useGetSinglePreviewImageProps['size'];
} & Omit<RawNftPreviewAssetProps, 'tokenUrl'>;

/**
 * Make sure to wrap this in a boundary / fallback of your choice.
 * In the future, we may generalize this to default boundaries / fallbacks.
 */
function NftPreviewAssetToWrapInBoundary({
  tokenRef,
  mediaSize,
  priority,
  resizeMode,
  onLoad,
}: NftPreviewAssetToWrapInBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewAssetToWrapInBoundaryFragment on Token {
        dbid
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl =
    useGetSinglePreviewImage({
      tokenRef: token,
      preferStillFrameFromGif: true,
      size: mediaSize,
    }) ?? '';

  const { markTokenAsFailed } = useTokenStateManagerContext();
  const handleError = useCallback(() => {
    markTokenAsFailed(
      token.dbid,
      new CouldNotRenderNftError('RawNftPreviewAsset', 'Failed to render', { id: token.dbid })
    );
  }, [markTokenAsFailed, token.dbid]);

  return (
    <RawNftPreviewAsset
      tokenUrl={imageUrl}
      priority={priority}
      resizeMode={resizeMode}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

const MemoizedNftPreviewAssetToWrapInBoundary = memo(NftPreviewAssetToWrapInBoundary);

export {
  MemoizedNftPreviewAssetToWrapInBoundary as NftPreviewAssetToWrapInBoundary,
  MemoizedNftPreviewAsset as RawNftPreviewAsset,
};
