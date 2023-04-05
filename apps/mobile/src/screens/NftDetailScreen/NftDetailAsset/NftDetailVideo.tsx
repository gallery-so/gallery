import { ResizeMode, Video } from 'expo-av';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type Props = {
  videoUrl: string;
  outputDimensions: Dimensions;
  onLoad: (dimensions: Dimensions) => void;
};

export function NftDetailVideo({ outputDimensions, videoUrl, onLoad }: Props) {
  return (
    <Video
      style={outputDimensions}
      onReadyForDisplay={(event) => {
        onLoad(event.naturalSize);
      }}
      shouldPlay
      isLooping
      resizeMode={ResizeMode.CONTAIN}
      source={{
        uri: videoUrl,
        headers: { Accepts: 'image/avif;image/png' },
      }}
    />
  );
}
