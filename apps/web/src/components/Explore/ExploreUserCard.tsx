import Link from 'next/link';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ExploreUserCardFollowFragment$key } from '~/generated/ExploreUserCardFollowFragment.graphql';
import { ExploreUserCardFragment$key } from '~/generated/ExploreUserCardFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { pluralize } from '~/utils/string';

import Badge from '../Badge/Badge';
import breakpoints from '../core/breakpoints';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';

type Props = {
  userRef: ExploreUserCardFragment$key;
  queryRef: ExploreUserCardFollowFragment$key;
};

export default function ExploreUserCard({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ExploreUserCardFragment on GalleryUser {
        id
        username
        badges {
          name
          imageURL
          ...BadgeFragment
        }
        galleries {
          collections {
            id
          }
          tokenPreviews {
            large
          }
          hidden
        }
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment ExploreUserCardFollowFragment on Query {
        ...FollowButtonQueryFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnProfile = loggedInUserId && loggedInUserId === user?.id;

  if (!user) {
    throw new Error('No user available to showcase ExploreUserCard');
  }

  const userGalleries = useMemo(() => {
    return user.galleries ?? [];
  }, [user.galleries]);

  const tokenPreviews = useMemo(() => {
    const gallery = userGalleries.find(
      (gallery) => !gallery?.hidden && removeNullValues(gallery?.tokenPreviews).length > 0
    );

    return gallery?.tokenPreviews?.slice(0, 2) ?? [];
  }, [userGalleries]);

  const collectionCount = useMemo(() => {
    return userGalleries.reduce((sum, gallery) => {
      if (gallery === null || gallery.hidden || !gallery.collections) {
        return sum;
      }

      return sum + gallery.collections.length;
    }, 0);
  }, [userGalleries]);

  const userBadges = useMemo(() => {
    const badges = [];

    for (const badge of user.badges ?? []) {
      if (badge?.imageURL) {
        badges.push(badge);
      }
    }

    return badges;
  }, [user.badges]);

  return (
    // @ts-expect-error This is the future next/link version
    <StyledExploreUserCard legacyBehavior={false} href={`/${user.username}`}>
      <StyledContent gap={12} justify="space-between">
        <TokenPreviewContainer>
          {tokenPreviews.map(
            (url) => url?.large && <TokenPreview src={url.large} key={url.large} />
          )}
        </TokenPreviewContainer>
        <UserDetailsContainer>
          <UserDetailsText>
            <HStack gap={4} align="center">
              <Username>
                <strong>{user.username}</strong>
              </Username>
              <HStack align="center" gap={0}>
                {userBadges.map((badge) => (
                  <Badge key={badge.name} badgeRef={badge} />
                ))}
              </HStack>
            </HStack>
            <BaseM>
              {collectionCount} {pluralize(collectionCount, 'collection')}
            </BaseM>
          </UserDetailsText>
          {!isOwnProfile && <StyledFollowButton userRef={user} queryRef={query} />}
        </UserDetailsContainer>
      </StyledContent>
    </StyledExploreUserCard>
  );
}

const StyledExploreUserCard = styled(Link)`
  border-radius: 12px;
  background-color: ${colors.offWhite};
  padding: 12px;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;

  &:hover {
    background-color: ${colors.faint};
  }

  @media only screen and ${breakpoints.desktop} {
    height: 100%;
  }
`;

const StyledContent = styled(VStack)`
  height: 100%;
`;

const UserDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const UserDetailsText = styled(VStack)`
  overflow: hidden;
`;

const TokenPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2px;
`;

const TokenPreview = styled.img`
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const Username = styled(TitleM)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;
