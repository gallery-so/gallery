import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { ProfilePictureStack } from '~/components/ProfilePictureStack';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { useAdmireModal } from './AdmireModal/useAdmireModal';

type CommentLineProps = {
  eventRef: AdmireLineFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ eventRef, queryRef }: CommentLineProps) {
  const event = useFragment(
    graphql`
      fragment AdmireLineFragment on FeedEventOrError {
        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another admire beneath
        ... on FeedEvent {
          admires(last: 5) @connection(key: "Interactions_admires") {
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
          admires(last: 5) @connection(key: "Interactions_admires") {
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

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node.admirer);
      }
    }

    admires.reverse();

    return removeNullValues(admires);
  }, [event.admires?.edges]);

  const [admire] = nonNullAdmires;

  const admirerName = useMemo(() => {
    if (!admire) return '<unknown>';

    const isTheAdmirerTheLoggedInUser = query.viewer?.user?.dbid === admire.dbid;

    if (isTheAdmirerTheLoggedInUser) {
      return 'You';
    } else if (admire.username) {
      return admire.username;
    } else {
      return '<unknown>';
    }
  }, [admire, query.viewer?.user?.dbid]);

  const totalAdmires = event.admires?.pageInfo.total ?? 0;

  return (
    <Container gap={2} align="center">
      <ProfilePictureStack
        onClick={openAdmireModal}
        usersRef={nonNullAdmires}
        total={totalAdmires}
      />

      <BaseS onClick={openAdmireModal}>
        {totalAdmires > 1 ? (
          <strong>{totalAdmires} collectors </strong>
        ) : (
          <strong>{admirerName} </strong>
        )}
        admired this
      </BaseS>
    </Container>
  );
}

const Container = styled(HStack)`
  cursor: pointer;
`;
