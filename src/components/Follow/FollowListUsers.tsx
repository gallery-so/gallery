import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { FollowListUsersFragment$key } from '~/generated/FollowListUsersFragment.graphql';
import { getFirstLine } from '~/utils/getFirstLine';

type Props = {
  userRefs: FollowListUsersFragment$key;
  emptyListText?: string;
};

export default function FollowListUsers({
  userRefs,
  emptyListText = 'No users to display.',
}: Props) {
  const track = useTrack();

  const users = useFragment(
    graphql`
      fragment FollowListUsersFragment on GalleryUser @relay(plural: true) {
        dbid
        bio
        username
      }
    `,
    userRefs
  );

  const handleClick = useCallback(() => {
    track('Follower List Username Click');
  }, [track]);

  return (
    <StyledList>
      {users.map((user) => (
        <StyledListItem key={user.dbid} href={`/${user.username}`} onClick={handleClick}>
          <TitleS>{user.username}</TitleS>
          <BaseM>{user.bio && <Markdown text={getFirstLine(user.bio)} />}</BaseM>
        </StyledListItem>
      ))}
      {users.length === 0 && (
        <StyledEmptyList gap={48} align="center" justify="center">
          <BaseM>{emptyListText}</BaseM>
        </StyledEmptyList>
      )}
    </StyledList>
  );
}

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
const StyledListItem = styled.a`
  padding: 16px;
  text-decoration: none;

  &:hover {
    background: ${colors.offWhite};
  }

  // truncate bios
  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledEmptyList = styled(VStack)`
  height: 100%;
`;
