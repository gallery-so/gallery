import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAdmireModalFragment$key } from '~/generated/useAdmireModalFragment.graphql';
import { useAdmireModalQueryFragment$key } from '~/generated/useAdmireModalQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import { AdmireModal } from './AdmireModal';
type Props = {
  eventRef: useAdmireModalFragment$key;
  queryRef: useAdmireModalQueryFragment$key;
};
export function useAdmireModal({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment useAdmireModalFragment on FeedEvent {
        ...AdmireModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment useAdmireModalQueryFragment on Query {
        ...AdmireModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return useCallback(() => {
    showModal({
      content: <AdmireModal fullscreen={isMobile} eventRef={event} queryRef={query} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [event, isMobile, query, showModal]);
}
