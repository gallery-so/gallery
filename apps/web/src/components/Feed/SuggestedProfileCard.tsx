import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { SuggestedProfileCardFollowFragment$key } from '~/generated/SuggestedProfileCardFollowFragment.graphql';
import { SuggestedProfileCardFragment$key } from '~/generated/SuggestedProfileCardFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import Badge from '../Badge/Badge';
import breakpoints from '../core/breakpoints';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  userRef: SuggestedProfileCardFragment$key;
  queryRef: SuggestedProfileCardFollowFragment$key;
  showFollowButton?: boolean;
  onClick?: () => void;
};

export default function SuggestedProfileCard({
  userRef,
  queryRef,
  onClick,
  showFollowButton = true,
}: Props) {
  const user = useFragment(
    graphql`
      fragment SuggestedProfileCardFragment on GalleryUser {
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
        ...ProfilePictureFragment
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment SuggestedProfileCardFollowFragment on Query {
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

  const bioFirstLine = useMemo(() => {
    if (!unescapedBio) {
      return '';
    }
    return unescapedBio.split('\n')[0] ?? '';
  }, [unescapedBio]);

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
  const shouldShowFollowButton = showFollowButton && !isMobile && !isOwnProfile;

  return (
    <StyledSuggestedProfileCard onClick={onClick}>
      <StyledContent gap={4} justify="space-between">
        <TokenPreviewContainer>
          {tokenPreviews.map(
            (url) => url?.large && <TokenPreview src={url.large} key={url.large} />
          )}
        </TokenPreviewContainer>
        <ProfileDetailsContainer>
          <ProfileDetailsText gap={4}>
            <HStack gap={8} align="center" justify="space-between">
              <HStack gap={4} align="center">
                <ProfilePicture userRef={user} size="xs" />
                <Username>
                  <strong>{user.username}</strong>
                </Username>
                <HStack align="center" gap={0}>
                  {userBadges.map((badge) => (
                    <Badge key={badge.name} badgeRef={badge} eventContext={contexts['Explore']} />
                  ))}
                </HStack>
              </HStack>
              {isMobile && !isOwnProfile && (
                <StyledFollowButton
                  userRef={user}
                  queryRef={query}
                  source="Explore Page user card"
                />
              )}
            </HStack>
            <StyledUserDetailsContainer gap={8}>
              <StyledUserBio>
                <Markdown text={bioFirstLine} eventContext={contexts.Explore} />
              </StyledUserBio>
              {shouldShowFollowButton && (
                <WideFollowButton userRef={user} queryRef={query} source="Curated Feed user card" />
              )}
            </StyledUserDetailsContainer>
          </ProfileDetailsText>
        </ProfileDetailsContainer>
      </StyledContent>
    </StyledSuggestedProfileCard>
  );
}

const StyledSuggestedProfileCard = styled(HStack)`
  border-radius: 4px;
  background-color: ${colors.offWhite};
  padding: 8px;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;

  &:hover {
    background-color: ${colors.faint};
  }

  @media only screen and ${breakpoints.desktop} {
    min-width: 200px;
  }
`;

const StyledContent = styled(VStack)`
  height: 100%;
  width: 100%;
`;

const ProfileDetailsContainer = styled.div`
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

const ProfileDetailsText = styled(VStack)`
  overflow: hidden;
  width: 100%;
`;

const StyledUserDetailsContainer = styled(VStack)``;

const StyledUserBio = styled(BaseM)`
  height: 20px; // ensure consistent height even if bio is not present

  font-size: 14px;
  font-weight: 400;
  line-clamp: 1;
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
`;

export const TokenPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  min-height: 97px;
  grid-gap: 2px;
`;

export const TokenPreview = styled.img`
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const Username = styled(BaseM)`
  font-size: 16px;
  font-weight: 700;

  overflow: hidden;
  text-overflow: ellipsis;
`;

const WideFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 100%;
  height: 24px;
  line-height: 0;

  @media only screen and ${breakpoints.desktop} {
    width: 100%;
    height: 24px;
  }
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;
