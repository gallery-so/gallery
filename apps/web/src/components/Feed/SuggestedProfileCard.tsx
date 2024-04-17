import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import { SuggestedProfileCardFollowFragment$key } from '~/generated/SuggestedProfileCardFollowFragment.graphql';
import { SuggestedProfileCardFragment$key } from '~/generated/SuggestedProfileCardFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import { getUnescapedBioFirstLine } from '~/utils/sanity';

import Badge from '../Badge/Badge';
import breakpoints from '../core/breakpoints';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import ProcessedText from '../ProcessedText/ProcessedText';

type variantType = 'default' | 'compact';

type Props = {
  userRef: SuggestedProfileCardFragment$key;
  queryRef: SuggestedProfileCardFollowFragment$key;
  showFollowButton?: boolean;
  onClick?: () => void;
  variant?: variantType;
};

export default function SuggestedProfileCard({
  userRef,
  queryRef,
  onClick,
  showFollowButton = true,
  variant = 'default',
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
    throw new Error('No user available to showcase SuggestedProfileCard');
  }

  const bioFirstLine = useMemo(() => getUnescapedBioFirstLine(user?.bio), [user?.bio]);

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

  const shouldShowFollowButton = useMemo(
    () => showFollowButton && !isOwnProfile,
    [showFollowButton, isOwnProfile]
  );

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
                <Username variant={variant}>
                  <strong>{user.username}</strong>
                </Username>
                <HStack align="center" gap={0}>
                  {userBadges.map((badge) => (
                    <Badge key={badge.name} badgeRef={badge} eventContext={contexts['Search']} />
                  ))}
                </HStack>
              </HStack>
            </HStack>
            <VStack gap={8}>
              <StyledUserBio variant={variant}>
                <ProcessedText text={bioFirstLine} eventContext={contexts['Search']} />
              </StyledUserBio>
              {shouldShowFollowButton && (
                <WideFollowButton
                  userRef={user}
                  queryRef={query}
                  source="Search Default profile card"
                />
              )}
            </VStack>
          </ProfileDetailsText>
        </ProfileDetailsContainer>
      </StyledContent>
    </StyledSuggestedProfileCard>
  );
}

const StyledSuggestedProfileCard = styled(HStack)`
  border-radius: 4px;
  background-color: ${colors.faint};
  padding: 8px;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;

  &:hover {
    background-color: ${colors.porcelain};
  }

  @media only screen and ${breakpoints.desktop} {
    width: 250px;
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

const StyledUserBio = styled(BaseM)<{ variant: variantType }>`
  height: 20px; // ensure consistent height even if bio is not present
  font-size: 14px;
  font-weight: 400;
  line-clamp: 1;
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;

  ${({ variant }) =>
    variant === 'compact' &&
    css`
      font-size: 12px;
    `}
`;

export const TokenPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  grid-gap: 2px;
`;

export const TokenPreview = styled.img`
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const Username = styled(BaseM)<{ variant: variantType }>`
  font-size: 16px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ variant }) =>
    variant === 'compact' &&
    css`
      font-size: 14px;
    `}
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
