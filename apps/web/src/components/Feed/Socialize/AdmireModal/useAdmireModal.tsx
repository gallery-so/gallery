import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAdmireModalFragment$key } from '~/generated/useAdmireModalFragment.graphql';
import { useAdmireModalQueryFragment$key } from '~/generated/useAdmireModalQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import AdmireFeedEventModal from './AdmireFeedEventModal';
import { AdmirePostModal } from './AdmirePostModal';

type Props = {
  eventRef: useAdmireModalFragment$key;
  queryRef: useAdmireModalQueryFragment$key;
};
export function useAdmireModal({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment useAdmireModalFragment on FeedEventOrError {
        __typename
        ...AdmireFeedEventModalFragment
        ...AdmirePostModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment useAdmireModalQueryFragment on Query {
        ...AdmireFeedEventModalQueryFragment
        ...AdmirePostModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const ModalContent = useMemo(() => {
    if (event.__typename === 'FeedEvent') {
      return <AdmireFeedEventModal fullscreen={isMobile} eventRef={event} queryRef={query} />;
    }

    return <AdmirePostModal fullscreen={isMobile} postRef={event} queryRef={query} />;
  }, [event, isMobile, query]);

  return useCallback(() => {
    showModal({
      content: ModalContent,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [ModalContent, isMobile, showModal]);
}
