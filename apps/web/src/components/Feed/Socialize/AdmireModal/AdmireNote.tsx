import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import FollowButton from '~/components/Follow/FollowButton';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { AdmireNoteFragment$key } from '~/generated/AdmireNoteFragment.graphql';
import { AdmireNoteQueryFragment$key } from '~/generated/AdmireNoteQueryFragment.graphql';
import { IconWrapper } from '~/icons/SocializeIcons';

type AdmireNoteProps = {
  admireRef: AdmireNoteFragment$key;
  queryRef: AdmireNoteQueryFragment$key;
};

export function AdmireNote({ admireRef, queryRef }: AdmireNoteProps) {
  const admire = useFragment(
    graphql`
      fragment AdmireNoteFragment on Admire {
        __typename

        admirer {
          ...FollowButtonUserFragment
          ...HoverCardOnUsernameFragment
        }
      }
    `,
    admireRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireNoteQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const user = admire.admirer;

  if (!user) {
    return null;
  }

  return (
    <StyledListItem justify="space-between" gap={4}>
      {admire.admirer && <HoverCardOnUsername userRef={admire.admirer} />}
      <StyledFollowButton userRef={user} queryRef={query} />
    </StyledListItem>
  );
}

const StyledListItem = styled(ListItem)`
  ${IconWrapper} {
    padding-left: 0;
    cursor: default;
  }
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;
