import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { size } from '~/components/core/breakpoints';
import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { NftDetailGifFragment$key } from '~/generated/NftDetailGifFragment.graphql';
import { useBreakpoint } from '~/hooks/useWindowSize';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { noop } from '~/shared/utils/noop';
import { graphqlGetResizedNftImageUrlWithFallback } from '~/utils/token';

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
