import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { FollowListUsersFragment$key } from '~/generated/FollowListUsersFragment.graphql';

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

  const trimBreaklines = useCallback((text: string) => {
    return text.replace(/(\r\n|\n|\r|\\\n)/gm, '');
  }, []);

  return (
    <StyledList>
      {users.map((user) => (
        <StyledListItem key={user.dbid} href={`/${user.username}`} onClick={handleClick}>
          <TitleS>{user.username}</TitleS>
          <StyledBaseM>{user.bio && <Markdown text={trimBreaklines(user.bio)} />}</StyledBaseM>
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

const StyledBaseM = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 32px;
`;
const StyledListItem = styled.a`
  padding: 16px;
  text-decoration: none;

  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledEmptyList = styled(VStack)`
  height: 100%;
`;
