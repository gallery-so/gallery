import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewVideoFragment$key } from "~/generated/NftPreviewVideoFragment.graphql";
import { ResizeMode, Video } from "expo-av";
import { useWidthHeight } from "../../computeHeightAndWidth";

type NftPreviewVideoProps = {
  videoMediaRef: NftPreviewVideoFragment$key;
};

export function NftPreviewVideo({ videoMediaRef }: NftPreviewVideoProps) {
  const media = useFragment(
    graphql`
      fragment NftPreviewVideoFragment on VideoMedia {
        __typename
        contentRenderURLs {
          medium
        }
      }
    `,
    videoMediaRef
  );

  if (!media.contentRenderURLs?.medium) {
    return null;
  }

  const { dimensions, handleLoad } = useWidthHeight(
    media.contentRenderURLs?.medium
  );

  return (
    <Video
      style={{ ...dimensions }}
      onReadyForDisplay={(event) => {
        handleLoad(event.naturalSize.width, event.naturalSize.height);
      }}
      source={{
        uri: media.contentRenderURLs.medium,
      }}
      resizeMode={ResizeMode.CONTAIN}
      isLooping
    />
  );
}
