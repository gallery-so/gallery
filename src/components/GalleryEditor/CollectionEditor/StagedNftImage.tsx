import { useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import NftPreviewLabel from '~/components/NftPreview/NftPreviewLabel';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { CouldNotRenderNftError } from '~/errors/CouldNotRenderNftError';
import { StagedNftImageImageNewFragment$key } from '~/generated/StagedNftImageImageNewFragment.graphql';
import { StagedNftImageNewFragment$key } from '~/generated/StagedNftImageNewFragment.graphql';
import { StagedNftImageVideoNewFragment$key } from '~/generated/StagedNftImageVideoNewFragment.graphql';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import getVideoOrImageUrlForNftPreview from '~/utils/graphql/getVideoOrImageUrlForNftPreview';

type Props = {
  tokenRef: StagedNftImageNewFragment$key;
  hideLabel: boolean;
};

function StagedNftImage({ tokenRef, hideLabel }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageNewFragment on Token {
        ...StagedNftImageVideoNewFragment
        ...StagedNftImageImageNewFragment
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const reportError = useReportError();
  const result = getVideoOrImageUrlForNftPreview(token, reportError);

  const [width, setWidth] = useState(0);
  const measuringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = measuringRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const inner = useMemo(() => {
    if (!result) {
      throw new CouldNotRenderNftError(
        'StatedNftImage',
        'could not compute getVideoOrImageUrlForNftPreview'
      );
    }

    if (!result.urls.large) {
      throw new CouldNotRenderNftError('StagedNftImage', 'could not find a large url');
    }

    if (result.type === 'video') {
      return (
        <StagedNftImageVideo
          size={width}
          hideLabel={hideLabel}
          tokenRef={token}
          url={result.urls.large}
        />
      );
    } else {
      return (
        <StagedNftImageImage
          size={width}
          hideLabel={hideLabel}
          tokenRef={token}
          url={result.urls.large}
        />
      );
    }
  }, [hideLabel, result, token, width]);

  return <div ref={measuringRef}>{inner}</div>;
}

type StagedNftImageImageProps = {
  url: string;
  size: number;
  hideLabel: boolean;
  tokenRef: StagedNftImageImageNewFragment$key;
};

function StagedNftImageImage({
  url,
  size,
  tokenRef,
  hideLabel,
  ...props
}: StagedNftImageImageProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageImageNewFragment on Token {
        ...NftPreviewLabelFragment
      }
    `,
    tokenRef
  );

  const { handleError } = useThrowOnMediaFailure('StagedNftImageImage');

  // We have to use this since we're not using an actual img element
  // useImageFailureCheck({ url, onLoad, onError: handleError });

  return (
    <StyledGridImage srcUrl={url} size={size} {...props}>
      {hideLabel ? null : <StyledNftPreviewLabel tokenRef={token} interactive={false} />}
    </StyledGridImage>
  );
}

type StagedNftImageVideoProps = {
  url: string;
  size: number;
  hideLabel: boolean;
  tokenRef: StagedNftImageVideoNewFragment$key;
};

function StagedNftImageVideo({
  url,
  size,
  tokenRef,
  hideLabel,
  ...props
}: StagedNftImageVideoProps) {
  const token = useFragment(
    graphql`
      fragment StagedNftImageVideoNewFragment on Token {
        ...NftPreviewLabelFragment
      }
    `,
    tokenRef
  );

  return (
    <VideoContainer size={size} {...props}>
      <StyledGridVideo src={url} />
      {hideLabel ? null : <StyledNftPreviewLabel tokenRef={token} interactive={false} />}
    </VideoContainer>
  );
}

const VideoContainer = styled.div<{ size: number }>`
  // TODO handle non square videos
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
`;

const StyledGridVideo = styled.video`
  width: 100%;
`;

type StyledGridImageProps = {
  srcUrl: string;
  size: number;
};

const StyledGridImage = styled.div<StyledGridImageProps>`
  background-image: ${({ srcUrl }) => `url(${srcUrl})`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  // TODO handle non square images
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
`;

const StyledNftPreviewLabel = styled(NftPreviewLabel)`
  opacity: 0;
`;

export default StagedNftImage;
