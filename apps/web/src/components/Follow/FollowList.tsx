import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import TextButton, { StyledButtonText } from '~/components/core/Button/TextButton';
import { HStack } from '~/components/core/Spacer/Stack';
import { MODAL_PADDING_THICC_PX } from '~/contexts/modal/constants';
import { FollowListFragment$key } from '~/generated/FollowListFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import FollowListUsers from './FollowListUsers';

type Props = {
  userRef: FollowListFragment$key;
};

export default function FollowList({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowListFragment on GalleryUser {
        followers @required(action: THROW) {
          ...FollowListUsersFragment
        }
        following @required(action: THROW) {
          ...FollowListUsersFragment
        }
      }
    `,
    userRef
  );

  const [displayedList, setDisplayedList] = useState<'followers' | 'following'>('followers');
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const userList = displayedList === 'followers' ? user.followers : user.following;

  const nonNullUserList = useMemo(() => removeNullValues(userList), [userList]);

  return (
    <StyledFollowList fullscreen={isMobile}>
      <StyledHeader gap={16} justify="center">
        <StyledHeaderTextRight>
          <StyledTextButton
            text="Followers"
            onClick={() => setDisplayedList('followers')}
            active={displayedList === 'followers'}
          />
        </StyledHeaderTextRight>
        <StyledHeaderText>
          <StyledTextButton
            text="Following"
            onClick={() => setDisplayedList('following')}
            active={displayedList === 'following'}
          />
        </StyledHeaderText>
      </StyledHeader>
      <FollowListUsers
        userRefs={nonNullUserList}
        emptyListText={
          displayedList === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'
        }
      />
    </StyledFollowList>
  );
}

const StyledFollowList = styled.div<{ fullscreen: boolean }>`
  height: 100%;
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;

  ${({ fullscreen }) =>
    fullscreen
      ? css`
          width: 100%;
          padding: ${MODAL_PADDING_THICC_PX}px 8px;
        `
      : css`
          width: 540px;
        `}
`;

const StyledHeader = styled(HStack)`
  padding-bottom: ${MODAL_PADDING_THICC_PX}px;
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
    color: ${colors.black['800']};
  }`}
`;
