import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewFragment$key } from "~/generated/NftPreviewFragment.graphql";
import { Text, View } from "react-native";
import { useMemo } from "react";
import { NftPreviewVideo } from "./NftPreviewVideo";
import { NftPreviewImage } from "./NftPreviewImage";
import { NftPreviewGif } from "./NftPreviewGif";
import { NftPreviewHtml } from "./NftPreviewHtml";

type NftPreviewProps = {
  tokenRef: NftPreviewFragment$key;
};

export function NftPreview({ tokenRef }: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        __typename

        name

        media {
          __typename

          ... on VideoMedia {
            ...NftPreviewVideoFragment
          }

          ... on ImageMedia {
            ...NftPreviewImageFragment
          }

          ... on GIFMedia {
            ...NftPreviewGifFragment
          }

          ... on HtmlMedia {
            ...NftPreviewHtmlFragment
          }
        }
      }
    `,
    tokenRef
  );

  const mediaContent = useMemo(() => {
    if (token.media?.__typename === "VideoMedia") {
      return <NftPreviewVideo videoMediaRef={token.media} />;
    } else if (token.media?.__typename === "ImageMedia") {
      return <NftPreviewImage imageMediaRef={token.media} />;
    } else if (token.media?.__typename === "GIFMedia") {
      return <NftPreviewGif gifMediaRef={token.media} />;
    } else if (token.media?.__typename === "HtmlMedia") {
      return <NftPreviewHtml htmlMediaRef={token.media} />;
    }

    console.log(token.media?.__typename, "Unsupported");

    return null;
  }, []);

  return <View>{mediaContent}</View>;

  return null;
}
