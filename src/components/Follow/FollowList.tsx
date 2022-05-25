import TextButton, { StyledButtonText } from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { pluralize } from './FollowerCount';

type Props = {
  userRef: any;
};

const getFirstLine = (text: string) => (text ? text.split('\n')[0] : '');

export default function FollowList({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowListFragment on GalleryUser {
        followers {
          dbid
          username
          bio
        }
        following {
          dbid
          username
          bio
        }
      }
    `,
    userRef
  );

  const [displayedList, setDisplayedList] = useState<'followers' | 'following'>('followers');

  const userList = displayedList === 'followers' ? user.followers : user.following;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledFollowList fullscreen={isMobile}>
      <StyledHeader>
        <StyledHeaderTextRight>
          <StyledTextButton
            text={`${user.followers.length} ${pluralize(user.followers.length, 'follower')}`}
            onClick={() => setDisplayedList('followers')}
            active={displayedList === 'followers'}
          ></StyledTextButton>
        </StyledHeaderTextRight>
        <Spacer width={16} />
        <StyledHeaderText>
          <StyledTextButton
            text={`${user.following.length} Following`}
            onClick={() => setDisplayedList('following')}
            active={displayedList === 'following'}
          ></StyledTextButton>
        </StyledHeaderText>
      </StyledHeader>
      <StyledList>
        {userList.map((user: any) => (
          <StyledListItem key={user.dbid} href={`/${user.username}`}>
            <TitleS>{user.username}</TitleS>
            <BaseM>
              <Markdown text={getFirstLine(user.bio)} />
            </BaseM>
          </StyledListItem>
        ))}
        {userList.length === 0 && (
          <StyledEmptyList>
            <BaseM>
              {displayedList === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </BaseM>
            <Spacer height={48} />
          </StyledEmptyList>
        )}
      </StyledList>
    </StyledFollowList>
  );
}

const StyledFollowList = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100vh' : '640px')};
  max-height: calc(100vh - 48px); // 48px accounts for modal padding
  width: ${({ fullscreen }) => (fullscreen ? '100vw' : '540px')};
  max-width: calc(100vw - 48px); // 48px accounts for modal padding
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  padding: 0 24px 24px;

  display: flex;
  justify-content: center;
`;

const StyledHeaderText = styled.div`
  display: flex;
`;

const StyledHeaderTextRight = styled(StyledHeaderText)`
  justify-content: flex-end;
`;

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
`;

const StyledTextButton = styled(TextButton)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `${StyledButtonText} {
    color: ${colors.offBlack};
  }`}
`;

const StyledEmptyList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
`;
