import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { useFragment } from 'react-relay';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { graphql } from 'relay-runtime';
import { size } from 'components/core/breakpoints';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import noop from 'utils/noop';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { NftDetailGifFragment$key } from '__generated__/NftDetailGifFragment.graphql';

type Props = {
  tokenRef: NftDetailGifFragment$key;
  onClick?: () => void;
  onLoad: () => void;
};

function NftDetailGif({ tokenRef, onClick = noop, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailGifFragment on Token {
        name
        media @required(action: THROW) {
          ... on GIFMedia {
            __typename
            contentRenderURL
          }
        }
      }
    `,
    tokenRef
  );
  const breakpoint = useBreakpoint();

  const contentRenderURL = useMemo(() => {
    if (token.media.__typename === 'GIFMedia') {
      return token.media.contentRenderURL;
    }

    return '';
  }, [token.media]);

  console.log(token, contentRenderURL);

  const resizedImage = graphqlGetResizedNftImageUrlWithFallback(contentRenderURL, 1200);

  if (!resizedImage) {
    throw new CouldNotRenderNftError('NftDetailGif', 'resizedImage could not be computed', {
      contentRenderURL,
    });
  }

  const { url } = resizedImage;

  return (
    <ImageWithLoading
      src={url}
      alt={token.name ?? ''}
      heightType={breakpoint === size.desktop ? 'maxHeightMinScreen' : undefined}
      onClick={onClick}
      onLoad={onLoad}
    />
  );
}

export default NftDetailGif;
