import { useModalActions } from 'contexts/modal/ModalContext';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import GlobalAnnouncementPopover from './GlobalAnnouncementPopover';

const AUTH_REQUIRED = true;
const GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS = 400;

export default function useGlobalAnnouncementPopover(queryRef: any) {
  const query = useFragment(
    graphql`
      fragment useGlobalAnnouncementPopoverFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { showModal } = useModalActions();

  useEffect(() => {
    setTimeout(() => {
      if (AUTH_REQUIRED && !isAuthenticated) {
        return;
      }
      showModal({ content: <GlobalAnnouncementPopover />, isFullPage: true });
    }, GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS);
  }, [isAuthenticated, showModal]);
}
