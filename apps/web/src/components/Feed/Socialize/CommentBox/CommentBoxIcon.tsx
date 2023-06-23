import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommentBoxIconEventFragment$key } from '~/generated/CommentBoxIconEventFragment.graphql';
import { CommentBoxIconQueryFragment$key } from '~/generated/CommentBoxIconQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { CommentIcon } from '~/icons/SocializeIcons';

import { NotesModal } from '../NotesModal/NotesModal';

type Props = {
  queryRef: CommentBoxIconQueryFragment$key;
  eventRef: CommentBoxIconEventFragment$key;
};

export function CommentBoxIcon({ queryRef, eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CommentBoxIconEventFragment on FeedEvent {
        ...NotesModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentBoxIconQueryFragment on Query {
        ...NotesModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleClick = useCallback(() => {
    showModal({
      content: <NotesModal fullscreen={isMobile} eventRef={event} queryRef={query} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [event, isMobile, query, showModal]);

  return <CommentIcon onClick={handleClick} />;
}
