import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewGifFragment$key } from "~/generated/NftPreviewGifFragment.graphql";
import { Image } from "expo-image";

type NftPreviewGifProps = {
  gifMediaRef: NftPreviewGifFragment$key;
};

export function NftPreviewGif({ gifMediaRef }: NftPreviewGifProps) {
  const GifMedia = useFragment(
    graphql`
      fragment NftPreviewGifFragment on GIFMedia {
        __typename

        previewURLs {
          medium
        }
      }
    `,
    gifMediaRef
  );

  if (!GifMedia.previewURLs?.medium) {
    throw new Error("Missing Gif");
  }

  return (
    <Image
      cachePolicy="disk"
      style={{
        width: 250,
        height: 250,
      }}
      source={{ uri: GifMedia.previewURLs.medium }}
    />
  );
}
