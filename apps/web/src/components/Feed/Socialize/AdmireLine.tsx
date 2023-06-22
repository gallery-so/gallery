import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import { ProfilePictureStack } from '~/components/ProfilePictureStack';
import { AdmireLineEventFragment$key } from '~/generated/AdmireLineEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type CommentLineProps = {
  eventRef: AdmireLineEventFragment$key;
};

export function AdmireLine({ eventRef }: CommentLineProps) {
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
              admirer {
                ...ProfilePictureStackFragment
              }
            }
          }
        }
      }
    `,
    eventRef
  );

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

  const totalAdmires = event.admires?.pageInfo.total ?? 0;

  return (
    <HStack gap={4} align="flex-end">
      <ProfilePictureStack usersRef={nonNullAdmires} total={totalAdmires} />
    </HStack>
  );
}
