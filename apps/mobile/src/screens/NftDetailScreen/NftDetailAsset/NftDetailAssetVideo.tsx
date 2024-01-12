import { ResizeMode, Video } from 'expo-av';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type Props = {
  videoUrl: string;
  posterUrl?: string;
  outputDimensions: Dimensions;
  onLoad: (dimensions: Dimensions) => void;
  onError: () => void;
};

export function NftDetailAssetVideo({
  outputDimensions,
  posterUrl,
  videoUrl,
  onLoad,
  onError,
}: Props) {
  return (
    <Video
      style={outputDimensions}
      onReadyForDisplay={(event) => {
        onLoad(event.naturalSize);
      }}
      onError={onError}
      shouldPlay
      isLooping
      resizeMode={ResizeMode.CONTAIN}
      source={{ uri: videoUrl }}
      posterSource={posterUrl ? { uri: posterUrl } : undefined}
    />
  );
}
