import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import styled from 'styled-components';

type ContentWidthType = 'fullWidth' | 'maxWidth';

type ContentHeightType =
  | 'maxHeightScreen' // fill up to screen
  | 'inherit';

type Props = {
  className?: string;
  src: string;
  widthType?: ContentWidthType;
  heightType?: ContentHeightType;
};

export default function VideoWithLoading({
  className,
  widthType = 'maxWidth',
  heightType,
  src,
}: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();

  const maxHeight = useMemo(() => {
    if (heightType === 'maxHeightScreen') {
      return 'min(100%, 80vh)';
    }
    if (heightType === 'inherit') {
      return 'inherit';
    }
    return '100%';
  }, [heightType]);

  return (
    <StyledVideo
      className={className}
      maxHeight={maxHeight}
      widthType={widthType}
      // start a few frames in, in case the first frame is blank
      src={`${src}#t=0.5`}
      onLoadedData={setContentIsLoaded}
      preload="metadata"
    />
  );
}

type StyledVideoProps = {
  maxHeight: string;
  widthType: ContentWidthType;
};

const StyledVideo = styled.video<StyledVideoProps>`
  display: block;
  max-height: ${({ maxHeight }) => maxHeight};
  ${({ widthType }) => (widthType === 'fullWidth' ? 'width' : 'max-width')}: 100%;
`;
