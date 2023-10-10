import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ExploreUserCardFollowFragment$key } from '~/generated/ExploreUserCardFollowFragment.graphql';
import { ExploreUserCardFragment$key } from '~/generated/ExploreUserCardFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import Badge from '../Badge/Badge';
import breakpoints from '../core/breakpoints';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import Markdown from '../core/Markdown/Markdown';
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
        bio
        galleries {
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

  const { bio } = user;

  const unescapedBio = useMemo(() => (bio ? unescape(bio) : ''), [bio]);

  const userGalleries = useMemo(() => {
    return user.galleries ?? [];
  }, [user.galleries]);

  const tokenPreviews = useMemo(() => {
    const gallery = userGalleries.find(
      (gallery) => !gallery?.hidden && removeNullValues(gallery?.tokenPreviews).length > 0
    );

    return gallery?.tokenPreviews?.slice(0, 2) ?? [];
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

  const isMobile = useIsMobileWindowWidth();

  const bioFirstLine = useMemo(() => {
    if (!unescapedBio) {
      return '';
    }
    return unescapedBio.split('\n')[0] ?? '';
  }, [unescapedBio]);

  return (
    <StyledExploreUserCard
      to={{
        pathname: '/[username]',
        query: { username: user?.username ?? '' },
      }}
    >
      <StyledContent gap={12} justify="space-between">
        <TokenPreviewContainer>
          {tokenPreviews.map(
            (url) => url?.large && <TokenPreview src={url.large} key={url.large} />
          )}
        </TokenPreviewContainer>
        <UserDetailsContainer>
          <UserDetailsText>
            <HStack gap={4} align="center" justify="space-between">
              <HStack>
                <Username>
                  <strong>{user.username}</strong>
                </Username>
                <HStack align="center" gap={0}>
                  {userBadges.map((badge) => (
                    <Badge key={badge.name} badgeRef={badge} eventContext={contexts['Explore']} />
                  ))}
                </HStack>
              </HStack>
              {!isMobile && !isOwnProfile && (
                <StyledFollowButton
                  userRef={user}
                  queryRef={query}
                  source="Explore Page user card"
                />
              )}
            </HStack>
            <StyledUserBio>
              <Markdown text={bioFirstLine} />
            </StyledUserBio>
          </UserDetailsText>
        </UserDetailsContainer>
        {isMobile && !isOwnProfile && (
          <StyledFollowButton userRef={user} queryRef={query} source="Explore Page user card" />
        )}
      </StyledContent>
    </StyledExploreUserCard>
  );
}

const StyledExploreUserCard = styled(InteractiveLink)`
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
  width: 100%;
`;

const UserDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const UserDetailsText = styled(VStack)`
  overflow: hidden;
  width: 100%;
`;

const StyledUserBio = styled(BaseM)`
  height: 20px; // ensure consistent height even if bio is not present

  line-clamp: 1;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
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
