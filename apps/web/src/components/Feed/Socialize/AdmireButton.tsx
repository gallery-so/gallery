import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { AdmireButtonFragment$key } from '~/generated/AdmireButtonFragment.graphql';
import { AdmireButtonQueryFragment$key } from '~/generated/AdmireButtonQueryFragment.graphql';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import { AdmireIcon } from '~/icons/SocializeIcons';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

type AdmireButtonProps = {
  eventRef: AdmireButtonFragment$key;
  queryRef: AdmireButtonQueryFragment$key;
  onAdmire: () => void;
  onRemoveAdmire: (feedItemId: string, feedItemDbid: string, viewerAdmireDbid: string) => void;
};

export function AdmireButton({ eventRef, queryRef, onAdmire, onRemoveAdmire }: AdmireButtonProps) {
  const feedItem = useFragment(
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

  if (feedItem.__typename !== 'FeedEvent' && feedItem.__typename !== 'Post') {
    throw new Error(`Unexpected typename: ${feedItem.__typename}`);
  }

  const query = useFragment(
    graphql`
      fragment AdmireButtonQueryFragment on Query {
        viewer {
          __typename
        }
      }
    `,
    queryRef
  );
  const showAuthModal = useUniversalAuthModal();

  const track = useTrack();

  const handleRemoveAdmire = useCallback(async () => {
    if (!feedItem.viewerAdmire?.dbid) {
      return;
    }
    onRemoveAdmire(feedItem.id, feedItem.dbid, feedItem.viewerAdmire.dbid);
  }, [onRemoveAdmire, feedItem.dbid, feedItem.id, feedItem.viewerAdmire?.dbid]);

  const handleAdmire = useCallback(async () => {
    track('Button Click', {
      id: 'Admire Button',
      name: 'Admire',
      context: contexts.Posts,
    });

    if (query.viewer?.__typename !== 'Viewer') {
      showAuthModal();
      return;
    }

    onAdmire();
  }, [track, query.viewer?.__typename, onAdmire, showAuthModal]);

  const hasViewerAdmiredEvent = Boolean(feedItem.viewerAdmire);

  return (
    <AdmireIcon
      onClick={hasViewerAdmiredEvent ? handleRemoveAdmire : handleAdmire}
      active={hasViewerAdmiredEvent}
    />
  );
}
