import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewImageFragment$key } from "~/generated/NftPreviewImageFragment.graphql";
import { Image } from "expo-image";
import { useWidthHeight } from "../../computeHeightAndWidth";

type NftPreviewImageProps = {
  imageMediaRef: NftPreviewImageFragment$key;
};

export function NftPreviewImage({ imageMediaRef }: NftPreviewImageProps) {
  const imageMedia = useFragment(
    graphql`
      fragment NftPreviewImageFragment on ImageMedia {
        __typename

        previewURLs {
          medium
        }
      }
    `,
    imageMediaRef
  );

  if (!imageMedia.previewURLs?.medium) {
    throw new Error("Missing image");
  }

  const { dimensions, handleLoad } = useWidthHeight(
    imageMedia.previewURLs.medium
  );

  return (
    <Image
      cachePolicy="disk"
      onLoad={(event) => {
        handleLoad(event.source.width, event.source.height);
      }}
      style={{
        ...dimensions,
      }}
      source={{ uri: imageMedia.previewURLs.medium }}
    />
  );
}
