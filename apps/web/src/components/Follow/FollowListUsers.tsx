import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { FollowListUsersFragment$key } from '~/generated/FollowListUsersFragment.graphql';
import { FollowListUsersQueryFragment$key } from '~/generated/FollowListUsersQueryFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { BREAK_LINES } from '~/utils/regex';

import FollowListUserItem from './FollowListUserItem';

type Props = {
  queryRef: FollowListUsersQueryFragment$key;
  userRefs: FollowListUsersFragment$key;
  emptyListText?: string;
};

export default function FollowListUsers({
  queryRef,
  userRefs,
  emptyListText = 'No users to display.',
}: Props) {
  const track = useTrack();

  const query = useFragment(
    graphql`
      fragment FollowListUsersQueryFragment on Query {
        ...FollowListUserItemQueryFragment
      }
    `,
    queryRef
  );

  const users = useFragment(
    graphql`
      fragment FollowListUsersFragment on GalleryUser @relay(plural: true) {
        dbid
        bio
        username
        ...FollowListUserItemFragment
      }
    `,
    userRefs
  );

  const handleClick = useCallback(() => {
    track('Follower List Username Click');
  }, [track]);

  const [fadeUsernames, setFadeUsernames] = useState(false);
  const formattedUsersBio = useMemo(() => {
    return users.map((user) => {
      return {
        ...user,
        bio: (user.bio ?? '').replace(BREAK_LINES, ''),
      };
    });
  }, [users]);

  return (
    <StyledList>
      {formattedUsersBio.map((user) => (
        <FollowListUserItem
          key={user.dbid}
          username={user.username ?? ''}
          handleClick={handleClick}
          bio={user.bio}
          queryRef={query}
          userRef={user}
          fadeUsernames={fadeUsernames}
          setFadeUsernames={(val) => setFadeUsernames(val)}
        />
      ))}
      {formattedUsersBio.length === 0 && (
        <StyledEmptyList gap={48} align="center" justify="center">
          <BaseM>{emptyListText}</BaseM>
        </StyledEmptyList>
      )}
    </StyledList>
  );
}

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 12px;
`;

const StyledEmptyList = styled(VStack)`
  height: 100%;
`;
