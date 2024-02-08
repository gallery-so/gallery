import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { EventMediaFragment$key } from '~/generated/EventMediaFragment.graphql';
import { EventMediaQueryFragment$key } from '~/generated/EventMediaQueryFragment.graphql';

import FeedEventNftPreviewWrapper from './FeedEventNftPreviewWrapper';

type Props = {
  queryRef: EventMediaQueryFragment$key;
  tokenRef: EventMediaFragment$key;
  maxWidth: number;
  maxHeight: number;
};

// Renders each NFT preview in an event feed row within the given dimensions
export default function EventMedia({ queryRef, tokenRef, maxWidth, maxHeight }: Props) {
  const query = useFragment(
    graphql`
      fragment EventMediaQueryFragment on Query {
        ...FeedEventNftPreviewWrapperQueryFragment
      }
    `,
    queryRef
  );

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
      <FeedEventNftPreviewWrapper
        queryRef={query}
        tokenRef={token}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
      />
    </StyledEventMedia>
  );
}

const StyledEventMedia = styled.div<{ width: number; height: number }>`
  display: flex;
  max-width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;
