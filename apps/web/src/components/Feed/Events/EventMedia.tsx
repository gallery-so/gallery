import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { EventMediaFragment$key } from '~/generated/EventMediaFragment.graphql';
import { EventMediaQueryFragment$key } from '~/generated/EventMediaQueryFragment.graphql';

import FeedEventNftPreviewWrapper from './FeedEventNftPreviewWrapper';

type Props = {
  tokenRef: EventMediaFragment$key;
  queryRef: EventMediaQueryFragment$key;
  maxWidth: number;
  maxHeight: number;
};

// Renders each NFT preview in an event feed row within the given dimensions
export default function EventMedia({ tokenRef, queryRef, maxWidth, maxHeight }: Props) {
  const token = useFragment(
    graphql`
      fragment EventMediaFragment on CollectionToken {
        ...FeedEventNftPreviewWrapperFragment
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment EventMediaQueryFragment on Query {
        ...FeedEventNftPreviewWrapperQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledEventMedia width={maxWidth} height={maxHeight}>
      <FeedEventNftPreviewWrapper
        tokenRef={token}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        queryRef={query}
      />
    </StyledEventMedia>
  );
}

const StyledEventMedia = styled.div<{ width: number; height: number }>`
  display: flex;
  max-width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;
