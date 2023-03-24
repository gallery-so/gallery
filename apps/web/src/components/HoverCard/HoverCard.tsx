import unescape from 'lodash/unescape';
import { useMemo } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { HoverCardQuery } from '~/generated/HoverCardQuery.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import UserSharedCommunities from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

type HoverCardProps = {
  preloadedQuery: PreloadedQuery<HoverCardQuery>;
};

export const HoverCardQueryNode = graphql`
  query HoverCardQuery(
    $userId: DBID!
    $sharedCommunitiesFirst: Int
    $sharedCommunitiesAfter: String
  ) {
    userById(id: $userId) @required(action: THROW) {
      ... on GalleryUser {
        __typename
        id
        bio
        username
        badges {
          name
          imageURL
          ...BadgeFragment
        }
        ...FollowButtonUserFragment
        ...UserSharedCommunitiesFragment
      }
    }

    ...FollowButtonQueryFragment
    ...useLoggedInUserIdFragment
  }
`;

export function HoverCard({ preloadedQuery }: HoverCardProps) {
  const query = usePreloadedQuery(HoverCardQueryNode, preloadedQuery);

  const user = query.userById;

  if (user.__typename !== 'GalleryUser') {
    throw new ErrorWithSentryMetadata('Expected userById to return w/ typename GalleryUser', {
      typename: user.__typename,
    });
  }

  const userBadges = useMemo(() => {
    const badges = [];

    for (const badge of user?.badges ?? []) {
      if (badge?.imageURL) {
        badges.push(badge);
      }
    }

    return badges;
  }, [user?.badges]);

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnProfile = loggedInUserId === user?.id;
  const isLoggedIn = !!loggedInUserId;

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <>
      <StyledCardHeader align="center" gap={4}>
        {/* <HStack align="center" gap={4}> */}
        <StyledUsernameAndBadge align="center" gap={4}>
          <StyledCardUsername>{displayName}</StyledCardUsername>

          <HStack align="center" gap={0}>
            {userBadges.map((badge) => (
              // Might need to rethink this layout when we have more badges
              <Badge key={badge.name} badgeRef={badge} />
            ))}
          </HStack>
        </StyledUsernameAndBadge>

        {isLoggedIn && !isOwnProfile && (
          <StyledFollowButtonWrapper>
            <FollowButton userRef={user} queryRef={query} source="user hover card" />
          </StyledFollowButtonWrapper>
        )}
      </StyledCardHeader>

      {user.bio && (
        <StyledCardDescription>
          <BaseM>
            <Markdown text={unescape(user.bio)}></Markdown>
          </BaseM>
        </StyledCardDescription>
      )}
      {isLoggedIn && !isOwnProfile && <UserSharedCommunities queryRef={user} />}
    </>
  );
}

const StyledCardHeader = styled(HStack)`
  display: flex;

  min-width: 0;
  // enforce height on container since the follow button causes additional height
  height: 24px;
`;

const StyledUsernameAndBadge = styled(HStack)`
  min-width: 0;
`;

const StyledFollowButtonWrapper = styled.div`
  margin-right: 8px;
`;

const StyledCardUsername = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
  p {
    display: inline;
  }
`;
