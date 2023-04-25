import { ResizeMode, Video } from 'expo-av';
import { memo } from 'react';
import FastImage, { Priority } from 'react-native-fast-image';

import { SvgWebView } from '~/components/SvgWebView';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type Props = {
  tokenUrl: string;
  priority?: Priority;
  resizeMode: ResizeMode;
  onLoad?: (dimensions: Dimensions | null) => void;
};

function NftPreviewAsset({ tokenUrl, onLoad, priority, resizeMode }: Props) {
  if (tokenUrl.includes('svg')) {
    return (
      <SvgWebView
        onLoadEnd={(dimensions) => {
          onLoad?.(dimensions);
        }}
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

const MemoizedNftPreviewAsset = memo(NftPreviewAsset);

export { MemoizedNftPreviewAsset as NftPreviewAsset };
