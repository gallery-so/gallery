import Link from 'next/link';
import { MouseEventHandler, useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { ListItem } from '~/components/Feed/Socialize/CommentsModal/ListItem';
import FollowButton from '~/components/Follow/FollowButton';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { AdmireNoteFragment$key } from '~/generated/AdmireNoteFragment.graphql';
import { AdmireNoteQueryFragment$key } from '~/generated/AdmireNoteQueryFragment.graphql';
import { IconWrapper } from '~/icons/SocializeIcons';
import noop from '~/utils/noop';

type AdmireNoteProps = {
  admireRef: AdmireNoteFragment$key;
  queryRef: AdmireNoteQueryFragment$key;
  onClick?: () => void;
};

export function AdmireNote({ admireRef, queryRef, onClick = noop }: AdmireNoteProps) {
  const admire = useFragment(
    graphql`
      fragment AdmireNoteFragment on Admire {
        __typename
        admirer {
          username
          ...FollowButtonUserFragment
          ...HoverCardOnUsernameFragment
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

  const handleUsernameClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <StyledListItem justify="space-between" gap={4}>
      <HStack gap={4} align="center">
        <StyledLink href={userProfileLink} onClick={handleUsernameClick}>
          <ProfilePicture size="sm" userRef={admire.admirer} />
        </StyledLink>
        {admire.admirer && <HoverCardOnUsername userRef={admire.admirer} />}
      </HStack>
      <StyledFollowButton userRef={user} queryRef={query} />
    </StyledListItem>
  );
}

const StyledLink = styled(Link)`
  text-decoration: none;
`;

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
