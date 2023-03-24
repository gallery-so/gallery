import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { UserSharedInfoFragment$key } from '~/generated/UserSharedInfoFragment.graphql';

import UserSharedCommunities from './UserSharedCommunities';
import UserSharedFollowers from './UserSharedFollowers';

type Props = {
  userRef: UserSharedInfoFragment$key;
  showFollowers?: boolean;
};

export default function UserSharedInfo({ userRef, showFollowers = true }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSharedInfoFragment on GalleryUser {
        __typename
        ...UserSharedFollowersFragment
        ...UserSharedCommunitiesFragment
      }
    `,
    userRef
  );

  return (
    <StyledUserSharedInfo>
      <UserSharedCommunities queryRef={query} />
      {showFollowers && <UserSharedFollowers queryRef={query} />}
    </StyledUserSharedInfo>
  );
}

const StyledUserSharedInfo = styled(VStack)``;
