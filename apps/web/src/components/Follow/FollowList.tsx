import Link from 'next/link';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import TextButton, { StyledButtonText } from '~/components/core/Button/TextButton';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
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
      <StyledHeader>
        <StyledSpan
          active={displayedList === 'followers'}
          onClick={() => setDisplayedList('followers')}
        >
          <HStack gap={4} align="baseline">
            <span>Followers</span>
            {user.followers.length > 0 && <BaseS>{user.followers.length}</BaseS>}
          </HStack>
        </StyledSpan>
        <StyledSpan
          active={displayedList === 'following'}
          onClick={() => setDisplayedList('following')}
        >
          <HStack gap={4} align="baseline">
            <span>Following</span>
            {user.following.length > 0 && <BaseS>{user.following.length}</BaseS>}
          </HStack>
        </StyledSpan>
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
  display: flex;
  gap: 12px;
`;

const StyledSpan = styled.span<{ active: boolean }>`
  font-family: ${BODY_FONT_FAMILY};
  line-height: 21px;
  letter-spacing: -0.04em;
  font-weight: 500;
  font-size: 16px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }

  margin: 0;

  color: ${({ active }) => (active ? colors.black['800'] : colors.metal)};

  cursor: pointer;
  text-decoration: none;

  ${BaseS} {
    color: ${({ active }) => (active ? colors.black['800'] : colors.metal)};
  }
`;
