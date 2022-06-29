import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import FeedEventNftPreviewWrapper from './FeedEventNftPreviewWrapper';

type Props = {
  tokenRef: any;
  maxWidth: number;
  maxHeight: number;
};

// const DEFAULT_DIMENSIONS_DESKTOP = 259.33;
// const SMALL_DIMENSIONS_DESKTOP = 190.5;
// const DEFAULT_DIMENSIONS_MOBILE = 259.33;

export default function EventMedia({ tokenRef, maxWidth, maxHeight }: Props) {
  const token = useFragment(
    graphql`
      fragment EventMediaFragment on CollectionToken {
        ...FeedEventNftPreviewWrapperFragment
      }
    `,
    tokenRef
  );

  // const maxWidth = showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;
  // const maxHeight = showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;

  return (
    <StyledEventMedia width={maxWidth} height={maxHeight}>
      <FeedEventNftPreviewWrapper tokenRef={token} maxWidth={maxWidth} maxHeight={maxHeight} />
    </StyledEventMedia>
  );
}

const StyledEventMedia = styled.div<{ width: number; height: number }>`
  display: flex;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;
