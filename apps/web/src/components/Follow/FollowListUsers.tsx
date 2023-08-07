import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { FollowListUsersFragment$key } from '~/generated/FollowListUsersFragment.graphql';
import { FollowListUsersQueryFragment$key } from '~/generated/FollowListUsersQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { BREAK_LINES } from '~/utils/regex';

import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
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
        ...ProfilePictureFragment
        ...FollowButtonUserFragment
      }
    `,
    userRefs
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleClick = useCallback(() => {
    track('Follower List Username Click');
  }, [track]);

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

const StyledBaseM = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 12px;
`;

const StyledListItem = styled.a<{ isMobile: boolean }>`
  display: flex;
  padding-top: 16px;
  padding-bottom: 16px;
  text-decoration: none;
  gap: ${({ isMobile }) => (isMobile ? '4px' : '72px')};
  justify-content: space-between;

  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledEmptyList = styled(VStack)`
  height: 100%;
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;
