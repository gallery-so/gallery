import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { NftPreviewFragment$key } from "~/generated/NftPreviewFragment.graphql";
import { Text, View } from "react-native";
import { useMemo } from "react";
import { RawImage } from "./RawImage";
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

          ... on Media {
            previewURLs {
              medium
            }
          }
        }
      }
    `,
    tokenRef
  );

  const mediaContent = useMemo(() => {
    if (token.media?.previewURLs?.medium) {
      return <RawImage url={token.media.previewURLs.medium} />;
    }

    return null;
  }, []);

  return <View>{mediaContent}</View>;

  return null;
}
