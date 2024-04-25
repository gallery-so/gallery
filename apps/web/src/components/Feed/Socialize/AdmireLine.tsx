import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { useAdmireModal } from './AdmireModal/useAdmireModal';

type CommentLineProps = {
  eventRef: AdmireLineFragment$key;
  queryRef: AdmireLineQueryFragment$key;
  onAdmire: () => void;
};

export function AdmireLine({ eventRef, queryRef, onAdmire }: CommentLineProps) {
  const event = useFragment(
    graphql`
      fragment AdmireLineFragment on FeedEventOrError {
        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another admire beneath
        ... on FeedEvent {
          dbid
          previewAdmires: admires(last: 5) @connection(key: "Interactions_previewAdmires") {
            pageInfo {
              total
            }
            edges {
              node {
                __typename
                admirer {
                  dbid
                  username
                  ...ProfilePictureStackFragment
                }
              }
            }
          }
          ...useAdmireModalFragment
        }
        ... on Post {
          dbid
          previewAdmires: admires(last: 5) @connection(key: "Interactions_previewAdmires") {
            pageInfo {
              total
            }
            edges {
              node {
                __typename
                admirer {
                  dbid
                  username
                  ...ProfilePictureStackFragment
                }
              }
            }
          }
          ...useAdmireModalFragment
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireLineQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }
        ...useAdmireModalQueryFragment
      }
    `,
    queryRef
  );

  const openAdmireModal = useAdmireModal({ eventRef: event, queryRef: query });

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of event.previewAdmires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node.admirer);
      }
    }

    admires.reverse();

    return removeNullValues(admires);
  }, [event.previewAdmires?.edges]);

  const [admire] = nonNullAdmires;
  const viewerUserDbid = useMemo(
    () => (query.viewer?.__typename === 'Viewer' ? query.viewer?.user?.dbid : null),
    [query.viewer]
  );

  const admirerName = useMemo(() => {
    if (!admire) return '<unknown>';

    const isTheAdmirerTheLoggedInUser = viewerUserDbid === admire.dbid;

    if (isTheAdmirerTheLoggedInUser) {
      return 'You';
    } else if (admire.username) {
      return admire.username;
    } else {
      return '<unknown>';
    }
  }, [admire, viewerUserDbid]);

  const totalAdmires = event.previewAdmires?.pageInfo.total ?? 0;

  const showAuthModal = useUniversalAuthModal();
  const track = useTrack();

  const handleAdmire = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showAuthModal();
      return;
    }

    track('Admire Click');
    onAdmire();
  }, [onAdmire, query.viewer?.__typename, showAuthModal, track]);

  if (totalAdmires === 0) {
    return (
      <StyledFirstAdmireCta onClick={handleAdmire}>
        Be the first to admire this
      </StyledFirstAdmireCta>
    );
  }

  return (
    <Container gap={2} align="center">
      <ProfilePictureStack
        onClick={openAdmireModal}
        usersRef={nonNullAdmires}
        total={totalAdmires}
      />

      <BaseM onClick={openAdmireModal}>
        {totalAdmires > 1 ? (
          <strong>{totalAdmires} collectors </strong>
        ) : (
          <strong>{admirerName} </strong>
        )}
        admired this
      </BaseM>
    </Container>
  );
}

const Container = styled(HStack)`
  cursor: pointer;
`;

const StyledFirstAdmireCta = styled(TitleDiatypeM)`
  cursor: pointer;
`;
