import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewVideoFragment$key } from "~/generated/NftPreviewVideoFragment.graphql";
import { ResizeMode, Video } from "expo-av";
import { useState } from "react";
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
          large
        }
      }
    `,
    videoMediaRef
  );

  if (!media.contentRenderURLs?.large) {
    return null;
  }

  const { dimensions, handleLoad } = useWidthHeight(
    media.contentRenderURLs?.large
  );

  return (
    <Video
      style={{ ...dimensions }}
      onReadyForDisplay={(event) => {
        handleLoad(event.naturalSize.width, event.naturalSize.height);
      }}
      source={{
        uri: media.contentRenderURLs.large,
      }}
      resizeMode={ResizeMode.CONTAIN}
      isLooping
    />
  );
}
