import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePictureStack } from '~/components/ProfilePictureStack';
import { AdmireLineEventFragment$key } from '~/generated/AdmireLineEventFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { useAdmireModal } from './AdmireModal/useAdmireModal';

type CommentLineProps = {
  eventRef: AdmireLineEventFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ eventRef, queryRef }: CommentLineProps) {
  const event = useFragment(
    graphql`
      fragment AdmireLineEventFragment on FeedEvent {
        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
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
                ...HoverCardOnUsernameFragment
              }
            }
          }
        }
        ...useAdmireModalFragment
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
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

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

  if (isPfpEnabled) {
    return (
      <HStack gap={4} align="flex-end" onClick={openAdmireModal}>
        <ProfilePictureStack usersRef={nonNullAdmires} total={totalAdmires} />
      </HStack>
    );
  }

  return (
    <HStack gap={4} align="flex-end">
      {admire && (
        <HoverCardOnUsername userRef={admire}>
          <AdmirerName>{admirerName}</AdmirerName>
        </HoverCardOnUsername>
      )}
      {totalAdmires === 1 ? (
        <AdmirerText>admired this</AdmirerText>
      ) : (
        <>
          <AdmirerText>and</AdmirerText>
          <AdmirerLink onClick={openAdmireModal}>
            {/*                                  |-- Checking for two here since we have  */}
            {/*                                  |   to subtract one to get the remaining count */}
            {totalAdmires - 1} {totalAdmires === 2 ? 'other' : 'others'}
          </AdmirerLink>
          <AdmirerText>admired this</AdmirerText>
        </>
      )}
    </HStack>
  );
}

const AdmirerName = styled.a`
  font-family: ${BODY_FONT_FAMILY};
  vertical-align: bottom;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
  text-decoration: none;
  color: ${colors.black['800']};
`;

const AdmirerText = styled.div`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 400;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const AdmirerLink = styled.span`
  cursor: pointer;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 1;
  font-weight: 400;
  text-decoration: underline;
  color: ${colors.shadow};

  &:hover {
    text-decoration: none;
  }
`;
