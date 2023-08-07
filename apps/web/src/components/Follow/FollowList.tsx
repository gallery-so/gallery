import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { FollowListFragment$key } from '~/generated/FollowListFragment.graphql';
import { FollowListQueryFragment$key } from '~/generated/FollowListQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import FollowListUsers from './FollowListUsers';

type Props = {
  queryRef: FollowListQueryFragment$key;
  userRef: FollowListFragment$key;
};

export default function FollowList({ userRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FollowListQueryFragment on Query {
        ...FollowListUsersQueryFragment
      }
    `,
    queryRef
  );

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

  const userList = displayedList === 'followers' ? user.followers : user.following;

  const nonNullUserList = useMemo(() => removeNullValues(userList), [userList]);

  return (
    <StyledFollowList>
      <StyledHeader>
        <StyledSpan
          active={displayedList === 'followers'}
          onClick={() => setDisplayedList('followers')}
        >
          <HStack gap={4} align="baseline">
            <span>Followers</span>
            {user.followers.length > 0 && (
              <BaseS color={displayedList === 'followers' ? colors.black['800'] : colors.metal}>
                {user.followers.length}
              </BaseS>
            )}
          </HStack>
        </StyledSpan>
        <StyledSpan
          active={displayedList === 'following'}
          onClick={() => setDisplayedList('following')}
        >
          <HStack gap={4} align="baseline">
            <span>Following</span>
            {user.following.length > 0 && (
              <BaseS color={displayedList === 'following' ? colors.black['800'] : colors.metal}>
                {user.following.length}
              </BaseS>
            )}
          </HStack>
        </StyledSpan>
      </StyledHeader>
      <FollowListUsers
        queryRef={query}
        userRefs={nonNullUserList}
        emptyListText={
          displayedList === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'
        }
      />
    </StyledFollowList>
  );
}

const StyledFollowList = styled.div`
  height: 100%;
  width: 100%;
  padding-top: 24px;
  border-top: 1px solid ${colors.porcelain};
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled(HStack)`
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
`;
