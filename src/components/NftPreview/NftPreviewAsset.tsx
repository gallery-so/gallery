import { NftMediaType } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';

import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { Nft } from 'types/Nft';
import { getMediaTypeForAssetUrl, graphqlGetResizedNftImageUrlWithFallback } from 'utils/nft';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
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
            contentRenderURLs @required(action: NONE) {
              medium @required(action: NONE)
            }
          }
          ... on ImageMedia {
            contentRenderURLs @required(action: NONE) {
              medium @required(action: NONE)
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

  const setContentIsLoaded = useSetContentIsLoaded();

  if (nft.media?.__typename === 'VideoMedia') {
    return (
      <StyledVideo
        src={`${nft.media.contentRenderURLs.medium}#t=0.5`}
        onLoadStart={setContentIsLoaded}
        preload="metadata"
      />
    );
  } else if (nft.media?.__typename === 'ImageMedia') {
    return (
      <ImageWithLoading
        src={graphqlGetResizedNftImageUrlWithFallback(nft.media.contentRenderURLs.medium, size)}
        alt={nft.name ?? ''}
      />
    );
  } else if (nft.media?.__typename === 'UnknownMedia') {
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
