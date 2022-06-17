import TextButton, { StyledButtonText } from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { MODAL_PADDING_PX } from 'contexts/modal/constants';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { FollowListFragment$key } from '__generated__/FollowListFragment.graphql';

type Props = {
  userRef: FollowListFragment$key;
};

const getFirstLine = (text: string) => (text ? text.split('\n')[0] : '');

export default function FollowList({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowListFragment on GalleryUser {
        followers @required(action: THROW) {
          dbid
          username
          bio
        }
        following @required(action: THROW) {
          dbid
          username
          bio
        }
      }
    `,
    userRef
  );

  const [displayedList, setDisplayedList] = useState<'followers' | 'following'>('followers');
  const track = useTrack();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const userList = displayedList === 'followers' ? user.followers : user.following;

  const handleClick = useCallback(() => {
    track('Follower List Username Click');
  }, [track]);

  return (
    <StyledFollowList fullscreen={isMobile}>
      <StyledHeader>
        <StyledHeaderTextRight>
          <StyledTextButton
            text="Followers"
            onClick={() => setDisplayedList('followers')}
            active={displayedList === 'followers'}
          />
        </StyledHeaderTextRight>
        <Spacer width={16} />
        <StyledHeaderText>
          <StyledTextButton
            text="Following"
            onClick={() => setDisplayedList('following')}
            active={displayedList === 'following'}
          />
        </StyledHeaderText>
      </StyledHeader>
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
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 8px;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_PX}px;

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

  // truncate bios
  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
