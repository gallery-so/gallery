import unescape from 'lodash/unescape';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Badge from '~/components/Badge/Badge';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import { HoverCardCommunityQuery } from '~/generated/HoverCardCommunityQuery.graphql';
import { HoverCardQuery } from '~/generated/HoverCardQuery.graphql';
import UserSharedInfo from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfo';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import CommunityProfilePicture from '../ProfilePicture/CommunityProfilePicture';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { ProfilePictureStack } from '../ProfilePicture/ProfilePictureStack';

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
  }
`;

export const HoverCardCommunityQueryNode = graphql`
  query HoverCardCommunityQuery($communityAddress: ChainAddressInput!) {
    communityByAddress(communityAddress: $communityAddress) {
      __typename
      ... on Community {
        name
        description
        contractAddress {
          address
          chain
        }
        ...CommunityProfilePictureFragment
        owners(onlyGalleryUsers: true, first: 10) {
          edges {
            node {
              user {
                ... on GalleryUser {
                  username
                  ...ProfilePictureStackFragment
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
      }
    }
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
  const isLoggedIn = Boolean(loggedInUserId);

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user.username) {
    return null;
  }

  const displayName = handleCustomDisplayName(user.username);

  return (
    <VStack gap={4}>
      <StyledCardHeaderContainer gap={8}>
        <StyledCardHeader align="center" justify="space-between">
          <StyledUsernameAndBadge align="center" gap={4}>
            <StyledLink href={userProfileLink}>
              <HStack align="center" gap={4}>
                <ProfilePicture userRef={user} size="md" />
                <StyledCardTitle>{displayName}</StyledCardTitle>
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

type HoverCardOnCommunityProps = {
  preloadedCommunityQuery: PreloadedQuery<HoverCardCommunityQuery>;
};

export function HoverCardOnCommunity({ preloadedCommunityQuery }: HoverCardOnCommunityProps) {
  const communityQuery = usePreloadedQuery(HoverCardCommunityQueryNode, preloadedCommunityQuery);

  const community = communityQuery.communityByAddress;

  if (community?.__typename !== 'Community') {
    throw new ErrorWithSentryMetadata('Expected userById to return w/ typename GalleryUser', {
      typename: community?.__typename,
    });
  }

  const owners = useMemo(() => {
    const list = community?.owners?.edges?.map((edge) => edge?.node?.user) ?? [];
    return removeNullValues(list);
  }, [community.owners?.edges]);

  const totalOwners = community?.owners?.pageInfo?.total ?? 0;

  const ownersToDisplay = useMemo(() => {
    // In most cases we display a max of 2 usernames. i.e, "username1, username2 and 3 others you follow"
    // But if there are exactly 3 owners, we display all 3 usernames. i.e, "username1, username2 and username3"
    const maxUsernamesToDisplay = totalOwners === 3 ? 3 : 2;
    return owners.slice(0, maxUsernamesToDisplay);
  }, [owners, totalOwners]);

  const content = useMemo(() => {
    // Display up to 3 usernames
    const result = ownersToDisplay.map((owner) => (
      <StyledInteractiveLink
        to={{
          pathname: `/[username]`,
          query: { username: owner.username ?? '' },
        }}
        key={owner.username}
      >
        {owner.username}
      </StyledInteractiveLink>
    ));

    // If there are more than 3 usernames, add a link to show all in a popover
    if (totalOwners > 3) {
      result.push(<StyledBaseS>{totalOwners - 2} others</StyledBaseS>);
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(1, 0, <StyledBaseS>,&nbsp;</StyledBaseS>);
    }
    if (result.length > 1) {
      result.splice(-1, 0, <StyledBaseS>&nbsp;and&nbsp;</StyledBaseS>);
    }

    return result;
  }, [ownersToDisplay, totalOwners]);

  const communityProfileLink = useMemo((): Route => {
    return {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as string,
      },
    };
  }, [community]);

  if (!community.name) {
    return null;
  }

  const displayName = handleCustomDisplayName(community?.name as string);

  return (
    <VStack gap={4}>
      <StyledCardHeaderContainer gap={8}>
        <StyledCardHeader align="center" justify="space-between">
          <HStack align="center" gap={4}>
            <HStack align="center" gap={4}>
              <CommunityProfilePicture communityRef={community} size="lg" />
              <VStack gap={4}>
                <StyledLink href={communityProfileLink}>
                  <StyledCardTitle>{displayName}</StyledCardTitle>
                </StyledLink>
                {community.description && (
                  <StyledCardDescription>
                    <BaseM>
                      <Markdown text={unescape(community.description)}></Markdown>
                    </BaseM>
                  </StyledCardDescription>
                )}
              </VStack>
            </HStack>
          </HStack>
        </StyledCardHeader>
      </StyledCardHeaderContainer>
      <HStack align="center" gap={4}>
        <ProfilePictureStack usersRef={owners} total={totalOwners} />
        <HStack gap={2} wrap="wrap">
          <StyledBaseS>Owned by&nbsp;</StyledBaseS>
          {content}
        </HStack>
      </HStack>
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
  outline: none;
  min-width: 0;
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

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
  font-size: 12px;
`;
