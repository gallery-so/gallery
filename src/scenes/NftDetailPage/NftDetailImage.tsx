import ImageWithLoading from 'components/ImageWithLoading/ImageWithLoading';
import { useFragment } from 'react-relay';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/nft';
import { graphql } from 'relay-runtime';
import { size } from 'components/core/breakpoints';
import { useBreakpoint } from 'hooks/useWindowSize';
import { NftDetailImageFragment$key } from '__generated__/NftDetailImageFragment.graphql';
import { useMemo } from 'react';

type Props = {
  nftRef: NftDetailImageFragment$key;
};

function NftDetailImage({ nftRef }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftDetailImageFragment on Nft {
        name
        media @required(action: THROW) {
          ... on ImageMedia {
            __typename
            contentRenderURLs @required(action: THROW) {
              raw @required(action: THROW)
              large
            }
          }
        }
      }
    `,
    nftRef
  );
  const breakpoint = useBreakpoint();

  const contentRenderURL = useMemo(() => {
    if (nft.media.__typename === 'ImageMedia') {
      return nft.media.contentRenderURLs.large || nft.media.contentRenderURLs.raw;
    }

    return '';
  }, [nft.media]);

  return (
    <ImageWithLoading
      src={graphqlGetResizedNftImageUrlWithFallback(contentRenderURL, 1200)}
      alt={nft.name ?? ''}
      heightType={breakpoint === size.desktop ? 'maxHeightScreen' : undefined}
    />
  );
}

export default NftDetailImage;
