import { useRouter } from 'next/router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { RemainingCommentCountFragment$key } from '~/generated/RemainingCommentCountFragment.graphql';
import { RemainingCommentCountQueryFragment$key } from '~/generated/RemainingCommentCountQueryFragment.graphql';
import colors from '~/shared/theme/colors';

import { useCommentsModal } from './CommentsModal/useCommentsModal';

type RemainingAdmireCountProps = {
  eventRef: RemainingCommentCountFragment$key;
  queryRef: RemainingCommentCountQueryFragment$key;
  totalComments: number;
};

export function RemainingCommentCount({
  eventRef,
  queryRef,
  totalComments,
}: RemainingAdmireCountProps) {
  const event = useFragment(
    graphql`
      fragment RemainingCommentCountFragment on FeedEventOrError {
        ... on FeedEvent {
          ...useCommentsModalFragment
        }
        ... on Post {
          ...useCommentsModalFragment
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment RemainingCommentCountQueryFragment on Query {
        ...useCommentsModalQueryFragment
      }
    `,
    queryRef
  );

  const { route } = useRouter();

  const openCommentsModal = useCommentsModal({ eventRef: event, queryRef: query });

  if (totalComments <= 1) {
    return null;
  }

  return route === '/community/[chain]/[contractAddress]/live' ? (
    <StyledViewCommentsText>View all comments in the Gallery App</StyledViewCommentsText>
  ) : (
    <StyledViewCommentsText onClick={openCommentsModal}>
      View all {totalComments} comments
    </StyledViewCommentsText>
  );
}

const StyledViewCommentsText = styled.div.attrs({ role: 'button' })`
  cursor: pointer;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 1;

  color: ${colors.shadow};
`;
