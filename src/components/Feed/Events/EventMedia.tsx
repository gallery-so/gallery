import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { EventMediaFragment$key } from '__generated__/EventMediaFragment.graphql';
import FeedEventNftPreviewWrapper from './FeedEventNftPreviewWrapper';

type Props = {
  tokenRef: EventMediaFragment$key;
  maxWidth: number;
  maxHeight: number;
};

// Renders each NFT preview in an event feed row within the given dimensions
export default function EventMedia({ tokenRef, maxWidth, maxHeight }: Props) {
  const token = useFragment(
    graphql`
      fragment EventMediaFragment on CollectionToken {
        ...FeedEventNftPreviewWrapperFragment
      }
    `,
    tokenRef
  );

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
