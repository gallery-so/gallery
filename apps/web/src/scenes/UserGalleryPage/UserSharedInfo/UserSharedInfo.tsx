import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { UserSharedInfoFragment$key } from '~/generated/UserSharedInfoFragment.graphql';
import { UserSharedInfoQueryFragment$key } from '~/generated/UserSharedInfoQueryFragment.graphql';

import UserSharedCommunities from './UserSharedCommunities';
import UserSharedFollowers from './UserSharedFollowers';

type Props = {
  userRef: UserSharedInfoFragment$key;
  queryRef: UserSharedInfoQueryFragment$key;
};

export default function UserSharedInfo({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSharedInfoFragment on GalleryUser {
        __typename
        ...UserSharedFollowersFragment
        ...UserSharedCommunitiesFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserSharedInfoQueryFragment on Query {
        ...UserSharedFollowersQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledUserSharedInfo gap={4}>
      <UserSharedCommunities userRef={user} />
      <UserSharedFollowers userRef={user} queryRef={query} />
    </StyledUserSharedInfo>
  );
}

const StyledUserSharedInfo = styled(VStack)`
  p {
    display: inline-block; // allow for line breaks
  }
`;
