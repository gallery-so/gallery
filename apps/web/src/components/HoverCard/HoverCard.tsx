import unescape from 'lodash/unescape';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { HoverCardQuery } from '~/generated/HoverCardQuery.graphql';
import UserSharedInfo from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfo';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type HoverCardProps = {
  preloadedQuery: PreloadedQuery<HoverCardQuery>;
};

export const HoverCardQueryNode = graphql`
  query HoverCardQuery(
    $userId: DBID!
    $sharedCommunitiesFirst: Int
    $sharedCommunitiesAfter: String
    $sharedFollowersFirst: Int
    $sharedFollowersAfter: String
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
        ...UserSharedInfoFragment
        ...ProfilePictureFragment
      }
    }

    ...FollowButtonQueryFragment
    ...useLoggedInUserIdFragment
    ...isFeatureEnabledFragment
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

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);
  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

  return (
    <VStack gap={4}>
      <StyledCardHeaderContainer gap={8}>
        <StyledCardHeader align="center" justify="space-between">
          <StyledUsernameAndBadge align="center" gap={4}>
            <StyledLink href={userProfileLink}>
              <HStack align="center" gap={4}>
                {isPfpEnabled && <ProfilePicture userRef={user} size="md" />}
                <StyledCardUsername>{displayName}</StyledCardUsername>
              </HStack>
            </StyledLink>

            <HStack align="center" gap={0}>
              {userBadges.map((badge) => (
                // Might need to rethink this layout when we have more badges
                <Badge key={badge.name} badgeRef={badge} />
              ))}
            </HStack>
          </StyledUsernameAndBadge>

          {!isOwnProfile && (
            <StyledFollowButtonWrapper>
              <StyledFollowButton userRef={user} queryRef={query} source="user hover card" />
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
      </StyledCardHeaderContainer>
      {isLoggedIn && !isOwnProfile && <UserSharedInfo userRef={user} />}
    </VStack>
  );
}

const StyledCardHeader = styled(HStack)`
  display: flex;

  min-width: 0;
  // enforce height on container since the follow button causes additional height
  height: 24px;
`;

const StyledCardHeaderContainer = styled(VStack)`
  padding: 12px 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  min-width: 0;
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

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
`;
