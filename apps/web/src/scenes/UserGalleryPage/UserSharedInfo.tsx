import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSharedInfoFragment$key } from '~/generated/UserSharedInfoFragment.graphql';

import { HStack } from '../../components/core/Spacer/Stack';
import PaginatedUsersList from '../Modals/PaginatedUsersList';

type Props = {
  userRef: UserSharedInfoFragment$key;
};

export default function UserSharedInfo({ userRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSharedInfoFragment on GalleryUser {
        __typename
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              __typename
              ... on GalleryUser {
                __typename
                username
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...PaginatedUsersListFragment
      }
    `,
    userRef
  );
  const { showModal } = useModalActions();
  const handleShowAllFollowersClick = useCallback(() => {
    showModal({
      content: <PaginatedUsersList queryRef={query} />,
      headerText: 'Shared Followers',
      isPaddingDisabled: true,
    });
  }, [query, showModal]);

  const sharedFollowers = useMemo(
    () => query.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [],
    [query.sharedFollowers?.edges]
  );

  const totalSharedFollowers = query.sharedFollowers?.pageInfo?.total ?? 0;

  // Determine how many users to display by username
  const followersToDisplay = useMemo(() => {
    // In most cases we display a max of 2 usernames. ie "username1, username2 and 3 others you follow"
    // But if there are exactly 3 shared followers, we display all 3 usernames. ie "username1, username2 and username3"
    const maxUsernamesToDisplay = totalSharedFollowers === 3 ? 3 : 2;
    return sharedFollowers.slice(0, maxUsernamesToDisplay);
  }, [sharedFollowers, totalSharedFollowers]);

  const content = useMemo(() => {
    // Display up to 3 usernames
    const result = followersToDisplay.map(
      (user) =>
        user && (
          <StyledInteractiveLink href={`/${user.username}`} key={user.username}>
            {user.username}
          </StyledInteractiveLink>
        )
    );

    // If there are more than 3 usernames, add a link to show all in a popover
    if (totalSharedFollowers > 3) {
      result.push(
        <StyledInteractiveLink onClick={handleShowAllFollowersClick}>
          {totalSharedFollowers - 2} others you follow
        </StyledInteractiveLink>
      );
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(1, 0, <StyledBaseS>,&nbsp;</StyledBaseS>);
    }
    if (result.length > 1) {
      result.splice(-1, 0, <StyledBaseS>&nbsp;and&nbsp;</StyledBaseS>);
    }

    return result;
  }, [followersToDisplay, handleShowAllFollowersClick, totalSharedFollowers]);

  return (
    <StyledUserSharedInfo>
      {totalSharedFollowers > 0 && (
        <HStack align="center">
          <StyledBaseS>Followed by&nbsp;</StyledBaseS>
          {content}
        </HStack>
      )}
    </StyledUserSharedInfo>
  );
}

const StyledUserSharedInfo = styled(VStack)``;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
`;
