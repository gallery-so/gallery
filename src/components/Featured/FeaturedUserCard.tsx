import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedUserCardFollowFragment$key } from '~/generated/FeaturedUserCardFollowFragment.graphql';
import { FeaturedUserCardFragment$key } from '~/generated/FeaturedUserCardFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import { pluralize } from '~/utils/string';

import Badge from '../Badge/Badge';
import breakpoints from '../core/breakpoints';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';

type Props = {
  userRef: FeaturedUserCardFragment$key;
  queryRef: FeaturedUserCardFollowFragment$key;
};

export default function FeaturedUserCard({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FeaturedUserCardFragment on GalleryUser {
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
            small
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
      fragment FeaturedUserCardFollowFragment on Query {
        ...FollowButtonQueryFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnProfile = loggedInUserId && loggedInUserId === user?.id;

  const tokenPreviews = useMemo(() => {
    const gallery = user.galleries.find((gallery) => !gallery.hidden);

    return gallery?.tokenPreviews.slice(0, 2) ?? [];
  }, [user.galleries]);

  const collectionCount = useMemo(() => {
    return user.galleries.reduce((sum, gallery) => {
      return gallery.hidden ? sum : sum + gallery.collections.length;
    }, 0);
  }, [user.galleries]);

  const userBadges = useMemo(() => {
    const badges = [];

    for (const badge of user?.badges ?? []) {
      if (badge?.imageURL) {
        badges.push(badge);
      }
    }

    return badges;
  }, [user?.badges]);

  return (
    <StyledFeaturedUserCard href={`/${user.username}`}>
      <StyledContent gap={12} justify="space-between">
        <TokenPreviewContainer>
          {tokenPreviews.map((url) => (
            <TokenPreview src={url.small} key={url.small} />
          ))}
        </TokenPreviewContainer>
        <UserDetails>
          <VStack>
            <HStack gap={4} align="center">
              <TitleM>
                <strong>{user.username}</strong>
              </TitleM>
              <HStack align="center" gap={0}>
                {userBadges.map((badge) => (
                  // Might need to rethink this layout when we have more badges
                  <Badge key={badge.name} badgeRef={badge} />
                ))}
              </HStack>
            </HStack>
            <BaseM>
              {collectionCount} {pluralize(collectionCount, 'collection')}
            </BaseM>
          </VStack>
          {!isOwnProfile && (
            <div>
              <StyledFollowButton userRef={user} queryRef={query} />
            </div>
          )}
        </UserDetails>
      </StyledContent>
    </StyledFeaturedUserCard>
  );
}

const StyledFeaturedUserCard = styled.a`
  border-radius: 12px;
  background-color: ${colors.offWhite};
  padding: 12px;

  cursor: pointer;

  text-decoration: none;
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

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
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

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;
