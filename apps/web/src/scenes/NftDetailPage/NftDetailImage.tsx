import { size } from '~/components/core/breakpoints';
import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useBreakpoint } from '~/hooks/useWindowSize';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { noop } from '~/shared/utils/noop';
import isVideoUrl from '~/utils/isVideoUrl';
import { graphqlGetResizedNftImageUrlWithFallback } from '~/utils/token';

import { StyledVideo } from './NftDetailVideo';

type Props = {
  alt: string | null | undefined;
  imageUrl: string | null | undefined;
  onClick?: () => void;
  onLoad: () => void;
};

function NftDetailImage({ alt, imageUrl, onClick = noop, onLoad }: Props) {
  const breakpoint = useBreakpoint();
  const { handleError } = useThrowOnMediaFailure('NftDetailImage');

  const resizedImage = imageUrl ? graphqlGetResizedNftImageUrlWithFallback(imageUrl, 1200) : null;

  if (!resizedImage) {
    throw new CouldNotRenderNftError('NftDetailImage', 'resizedImage could not be computed', {
      imageUrl,
    });
  }

  const { url } = resizedImage;

  // TODO: this is a hack to handle videos that are returned by OS as images.
  // i.e., assets that do not have animation_urls, and whose image_urls all contain
  // links to videos. we should be able to remove this hack once we're off of OS.
  if (isVideoUrl(url)) {
    return (
      <StyledVideo
        onLoadedData={onLoad}
        onError={handleError}
        src={url}
        muted
        autoPlay
        loop
        playsInline
        controls
      />
    );
  }

  return (
    <ImageWithLoading
      alt={alt ?? ''}
      src={url}
      heightType={breakpoint === size.desktop ? 'maxHeightMinScreen' : undefined}
      onClick={onClick}
      onLoad={onLoad}
    />
  );
}

export default NftDetailImage;
