import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import FollowButton from '~/components/Follow/FollowButton';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
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
          ...UserHoverCardFragment
          ...ProfilePictureFragment
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
      <HStack gap={4} align="center">
        <ProfilePicture size="sm" userRef={admire.admirer} />
        {admire.admirer && <UserHoverCard userRef={admire.admirer} />}
      </HStack>
      <StyledFollowButton userRef={user} queryRef={query} />
    </StyledListItem>
  );
}

const StyledListItem = styled(ListItem)`
  padding: 12px 16px;
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
