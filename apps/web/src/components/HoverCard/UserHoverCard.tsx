import { Route } from 'nextjs-routes';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import {
  graphql,
  PreloadedQuery,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay';
import styled from 'styled-components';

import { UserHoverCardContentQuery } from '~/generated/UserHoverCardContentQuery.graphql';
import { UserHoverCardFragment$key } from '~/generated/UserHoverCardFragment.graphql';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import UserSharedInfo from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfo';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';
import { contexts } from '~/shared/analytics/constants';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import Badge from '../Badge/Badge';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeM, TitleM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import HoverCard, { HoverCardProps } from './HoverCard';

const UserHoverCardContentQueryNode = graphql`
  query UserHoverCardContentQuery(
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
  }
`;

type Props = PropsWithChildren<{
  userRef: UserHoverCardFragment$key;
  onClick?: HoverCardProps<UserHoverCardContentQuery>['onHoverableElementClick'];
  fitContent?: boolean;
}>;

export default function UserHoverCard({ children, userRef, onClick, fitContent }: Props) {
  const user = useFragment(
    graphql`
      fragment UserHoverCardFragment on GalleryUser {
        dbid
        username
      }
    `,
    userRef
  );

  const [preloadedHoverCardQuery, preloadHoverCardQuery] =
    useQueryLoader<UserHoverCardContentQuery>(UserHoverCardContentQueryNode);

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  const handlePreloadQuery = useCallback(() => {
    preloadHoverCardQuery({
      userId: user.dbid,
      sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
      sharedFollowersFirst: FOLLOWERS_PER_PAGE,
    });
  }, [preloadHoverCardQuery, user.dbid]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <HoverCard
      HoverableElement={children ?? <TitleDiatypeM>{displayName}</TitleDiatypeM>}
      onHoverableElementClick={onClick}
      hoverableElementHref={userProfileLink}
      HoveringContent={
        preloadedHoverCardQuery ? (
          <UserHoverCardContent preloadedQuery={preloadedHoverCardQuery} />
        ) : null
      }
      preloadQuery={handlePreloadQuery}
      preloadedQuery={preloadedHoverCardQuery}
      fitContent={fitContent}
    />
  );
}

function UserHoverCardContent({
  preloadedQuery,
}: {
  preloadedQuery: PreloadedQuery<UserHoverCardContentQuery>;
}) {
  const query = usePreloadedQuery(UserHoverCardContentQueryNode, preloadedQuery);

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
  const isLoggedIn = Boolean(loggedInUserId);

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <Section gap={4}>
      <StyledCardHeaderContainer gap={8}>
        <StyledCardHeader gap={2} align="center" justify="space-between">
          <StyledUsernameAndBadge align="center" gap={4}>
            <GalleryLink
              to={userProfileLink}
              eventElementId="User PFP"
              eventName="User PFP Click"
              eventContext={contexts['Hover Card']}
            >
              <HStack align="center" gap={4}>
                <ProfilePicture userRef={user} size="md" />
                <StyledCardTitle>{displayName}</StyledCardTitle>
              </HStack>
            </GalleryLink>

            <HStack align="center" gap={0}>
              {userBadges.map((badge) => (
                // Might need to rethink this layout when we have more badges
                <Badge key={badge.name} badgeRef={badge} eventContext={contexts['Hover Card']} />
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
              <Markdown text={user.bio} eventContext={contexts['Hover Card']} />
            </BaseM>
          </StyledCardDescription>
        )}
      </StyledCardHeaderContainer>
      {isLoggedIn && !isOwnProfile && <UserSharedInfo userRef={user} />}
    </Section>
  );
}

const Section = styled(VStack)`
  width: 100%;
`;

const StyledCardHeader = styled(HStack)`
  display: flex;
  min-width: 0;
  // enforce height on container since the follow button causes additional height
  height: 24px;
`;

const StyledCardHeaderContainer = styled(VStack)`
  padding-top: 6px;
  padding-bottom: 12px;
`;

const StyledUsernameAndBadge = styled(HStack)`
  min-width: 0;
`;

const StyledFollowButtonWrapper = styled.div`
  margin-right: 8px;
`;

const StyledCardTitle = styled(TitleM)`
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
