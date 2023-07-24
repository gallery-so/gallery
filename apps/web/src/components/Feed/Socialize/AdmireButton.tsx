import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { AdmireButtonFragment$key } from '~/generated/AdmireButtonFragment.graphql';
import { AdmireButtonQueryFragment$key } from '~/generated/AdmireButtonQueryFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

type AdmireButtonProps = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
  onAdmire: (subjectId: string, subjectDbid: string) => void;
  onRemoveAdmire: (subjectId: string, subjectDbid: string, viewerAdmireDbid: string) => void;
};

export function AdmireButton({ eventRef, queryRef, onAdmire, onRemoveAdmire }: AdmireButtonProps) {
  const subject = useFragment(
    graphql`
      fragment AdmireButtonFragment on FeedEventOrError {
        __typename
        ... on FeedEvent {
          id
          dbid

          viewerAdmire {
            dbid
          }
        }
        ... on Post {
          id
          dbid

          viewerAdmire {
            dbid
          }
        }
      }
    `,
    eventRef
  );

  if (subject.__typename !== 'FeedEvent' && subject.__typename !== 'Post') {
    throw new Error(`Unexpected typename: ${subject.__typename}`);
  }

  const query = useFragment(
    graphql`
      fragment AdmireButtonQueryFragment on Query {
        viewer {
          __typename
        }

        ...useAuthModalFragment
      }
    `,
    queryRef
  );
  const { showModal } = useModalActions();

  // const [admireFeedEvent] = useAdmireFeedEvent();
  // const [removeAdmireFeedEvent] = useRemovedAdmireFeedEvent();

  const track = useTrack();

  const handleRemoveAdmire = useCallback(async () => {
    if (!subject.viewerAdmire?.dbid) {
      return;
    }
    onRemoveAdmire(subject.id, subject.dbid, subject.viewerAdmire.dbid);
  }, [onRemoveAdmire, subject.dbid, subject.id, subject.viewerAdmire?.dbid]);

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
        headerText: 'Sign In',
      });

      return;
    }

    track('Admire Click');
    onAdmire(subject.id, subject.dbid);
  }, [query, track, onAdmire, subject.id, subject.dbid, showModal]);

  const hasViewerAdmiredEvent = Boolean(subject.viewerAdmire);

  return (
    <AdmireIcon
      onClick={hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}
      active={hasViewerAdmiredEvent}
    />
  );
}
