import { ResizeMode, Video } from 'expo-av';
import { graphql, useFragment } from 'react-relay';
import { CouldNotRenderNftError } from 'shared/errors/CouldNotRenderNftError';

import { NftDetailAssetVideoFragment$key } from '~/generated/NftDetailAssetVideoFragment.graphql';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type Props = {
  mediaRef: NftDetailAssetVideoFragment$key;
  posterUrl?: string;
  outputDimensions: Dimensions;
  onLoad: (dimensions: Dimensions) => void;
  onError: () => void;
};

export function NftDetailAssetVideo({
  mediaRef,
  posterUrl,
  outputDimensions,
  onLoad,
  onError,
}: Props) {
  const media = useFragment(
    graphql`
      fragment NftDetailAssetVideoFragment on VideoMedia {
        contentRenderURLs {
          large
        }
      }
    `,
    mediaRef
  );

  const videoUrl = media.contentRenderURLs?.large;

  if (!videoUrl) {
    throw new CouldNotRenderNftError('NftDetailAssetVideo', 'Video had no contentRenderUrl');
  }

  return (
    <Video
      style={outputDimensions}
      onReadyForDisplay={(event) => {
        onLoad(event.naturalSize);
      }}
      onError={onError}
      shouldPlay
      isLooping
      isMuted
      resizeMode={ResizeMode.CONTAIN}
      source={{ uri: videoUrl }}
      posterSource={posterUrl ? { uri: posterUrl } : undefined}
    />
  );
}
