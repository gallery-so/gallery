import TextButton, { StyledButtonText } from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { FollowListFragment$key } from '__generated__/FollowListFragment.graphql';
import FollowListUsers from './FollowListUsers';

type Props = {
  userRef: FollowListFragment$key;
};

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
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const userList = displayedList === 'followers' ? user.followers : user.following;

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
      <FollowListUsers
        userList={userList}
        emptyListText={
          displayedList === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'
        }
      />
    </StyledFollowList>
  );
}

const StyledFollowList = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_THICC_PX}px 8px;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_THICC_PX}px;

  display: flex;
  justify-content: center;
`;

const StyledHeaderText = styled.div`
  display: flex;
`;

const StyledHeaderTextRight = styled(StyledHeaderText)`
  justify-content: flex-end;
`;

const StyledTextButton = styled(TextButton)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `${StyledButtonText} {
    color: ${colors.offBlack};
  }`}
`;
