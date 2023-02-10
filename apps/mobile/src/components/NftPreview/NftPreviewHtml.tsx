import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewHtmlFragment$key } from "~/generated/NftPreviewHtmlFragment.graphql";
import { Image } from "expo-image";
import { useWidthHeight } from "src/computeHeightAndWidth";

type NftPreviewHtmlProps = {
  htmlMediaRef: NftPreviewHtmlFragment$key;
};

export function NftPreviewHtml({ htmlMediaRef }: NftPreviewHtmlProps) {
  const htmlMedia = useFragment(
    graphql`
      fragment NftPreviewHtmlFragment on HtmlMedia {
        __typename

        previewURLs {
          large
        }
      }
    `,
    htmlMediaRef
  );

  if (!htmlMedia.previewURLs?.large) {
    throw new Error("Yikes");
  }

  const { dimensions, handleLoad } = useWidthHeight(
    htmlMedia.previewURLs.large
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
      source={{ uri: htmlMedia.previewURLs.large }}
    />
  );
}
