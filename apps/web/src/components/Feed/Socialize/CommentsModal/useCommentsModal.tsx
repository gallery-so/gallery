import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useCommentsModalFragment$key } from '~/generated/useCommentsModalFragment.graphql';
import { useCommentsModalQueryFragment$key } from '~/generated/useCommentsModalQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import { FeedEventsCommentsModal } from './FeedEventsCommentsModal';
import PostCommentsModal from './PostCommentsModal';

type Props = {
  eventRef: useCommentsModalFragment$key;
  queryRef: useCommentsModalQueryFragment$key;
};

export function useCommentsModal({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment useCommentsModalFragment on FeedEventOrError {
        __typename
        ...FeedEventsCommentsModalFragment
        ...PostCommentsModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment useCommentsModalQueryFragment on Query {
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

  // depending on the feed item type, show different modal
  return useCallback(() => {
    showModal({
      content: ModalContent,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [ModalContent, isMobile, showModal]);
}
