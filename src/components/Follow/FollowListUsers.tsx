import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  userList: any;
  emptyListText?: string;
};

const getFirstLine = (text: string) => (text ? text.split('\n')[0] : '');

export default function FollowListUsers({
  userList,
  emptyListText = 'No users to display.',
}: Props) {
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Follower List Username Click');
  }, [track]);

  return (
    <StyledList>
      {userList.map((user: any) => (
        <StyledListItem key={user.dbid} href={`/${user.username}`} onClick={handleClick}>
          <TitleS>{user.username}</TitleS>
          <BaseM>
            <Markdown text={getFirstLine(user.bio)} />
          </BaseM>
        </StyledListItem>
      ))}
      {userList.length === 0 && (
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
