import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommentBoxIconEventFragment$key } from '~/generated/CommentBoxIconEventFragment.graphql';
import { CommentBoxIconFragment$key } from '~/generated/CommentBoxIconFragment.graphql';
import { CommentBoxIconQueryFragment$key } from '~/generated/CommentBoxIconQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { CommentIcon } from '~/icons/SocializeIcons';

import { CommentsModal } from '../CommentsModal/CommentsModal';
import { FeedEventsCommentsModal } from '../CommentsModal/FeedEventsCommentsModal';
import PostCommentsModal from '../CommentsModal/PostCommentsModal';

type Props = {
  queryRef: CommentBoxIconQueryFragment$key;
  eventRef: CommentBoxIconFragment$key;
};

export function CommentBoxIcon({ queryRef, eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CommentBoxIconFragment on FeedEventOrError {
        # ...CommentsModalFragment
        __typename
        ...FeedEventsCommentsModalFragment
        ...PostCommentsModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentBoxIconQueryFragment on Query {
        ...FeedEventsCommentsModalQueryFragment
        ...PostCommentsModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const ModalContent = useMemo(() => {
    if (event.__typename === 'FeedEvent') {
      return <FeedEventsCommentsModal fullscreen={isMobile} eventRef={event} queryRef={query} />;
    }

    return <PostCommentsModal fullscreen={isMobile} postRef={event} queryRef={query} />;
  }, [event, isMobile, query]);

  const handleClick = useCallback(() => {
    showModal({
      content: ModalContent,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [event, isMobile, query, showModal]);

  return <CommentIcon onClick={handleClick} />;
}
