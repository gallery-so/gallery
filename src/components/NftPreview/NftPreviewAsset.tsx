import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/nft';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewAssetFragment$key } from '__generated__/NftPreviewAssetFragment.graphql';

type Props = {
  nftRef: NftPreviewAssetFragment$key;
  size: number;
};

function NftPreviewAsset({ nftRef, size }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftPreviewAssetFragment on Nft {
        name
        media {
          __typename

          ... on VideoMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on ImageMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on UnknownMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
        }
      }
    `,
    nftRef
  );

  if (
    nft.media?.__typename === 'VideoMedia' ||
    nft.media?.__typename === 'ImageMedia' ||
    nft.media?.__typename === 'UnknownMedia'
  ) {
    return (
      <ImageWithLoading
        src={graphqlGetResizedNftImageUrlWithFallback(nft.media.previewURLs.large, size)}
        alt={nft.name ?? ''}
      />
    );
  }

  return null;
}

const StyledVideo = styled.video`
  display: flex;
  width: 100%;
`;

export default NftPreviewAsset;
