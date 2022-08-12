import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { useFragment } from 'react-relay';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { graphql } from 'relay-runtime';
import { size } from 'components/core/breakpoints';
import { useBreakpoint } from 'hooks/useWindowSize';
import { NftDetailImageFragment$key } from '__generated__/NftDetailImageFragment.graphql';
import { useMemo } from 'react';
import { StyledVideo } from './NftDetailVideo';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import noop from 'utils/noop';

type Props = {
  tokenRef: NftDetailImageFragment$key;
  onClick?: () => void;
};

function NftDetailImage({ tokenRef, onClick = noop }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailImageFragment on Token {
        name
        media @required(action: THROW) {
          ... on ImageMedia {
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
    if (token.media.__typename === 'ImageMedia') {
      return token.media.contentRenderURL;
    }

    return '';
  }, [token.media]);

  const { url } = graphqlGetResizedNftImageUrlWithFallback(contentRenderURL, 1200);

  // TODO: this is a hack to handle videos that are returned by OS as images.
  // i.e., assets that do not have animation_urls, and whose image_urls all contain
  // links to videos. we should be able to remove this hack once we're off of OS.
  const setContentIsLoaded = useSetContentIsLoaded();
  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return (
      <StyledVideo
        src={url}
        muted
        autoPlay
        loop
        playsInline
        controls
        onLoadedData={setContentIsLoaded}
      />
    );
  }

  return (
    <ImageWithLoading
      src={url}
      alt={token.name ?? ''}
      heightType={breakpoint === size.desktop ? 'maxHeightMinScreen' : undefined}
      onClick={onClick}
    />
  );
}

export default NftDetailImage;
