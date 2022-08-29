import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback } from 'react';
import styled from 'styled-components';
import { graphql, useFragment } from 'react-relay';
import { FollowListUsersFragment$key } from '../../../__generated__/FollowListUsersFragment.graphql';

type Props = {
  userRefs: FollowListUsersFragment$key;
  emptyListText?: string;
};

const getFirstLine = (text: string) => (text ? text.split('\n')[0] : '');

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
        <StyledEmptyList>
          <BaseM>{emptyListText}</BaseM>
          <Spacer height={48} />
        </StyledEmptyList>
      )}
    </StyledList>
  );
}

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
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

const StyledEmptyList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
`;
