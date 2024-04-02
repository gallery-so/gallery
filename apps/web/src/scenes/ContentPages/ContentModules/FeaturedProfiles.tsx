import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints, { size } from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { useBreakpoint, useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeaturedProfilesProps = {
  profiles: CmsTypes.FeaturedProfile[];
};

export default function FeaturedProfiles({ profiles }: FeaturedProfilesProps) {
  const breakpoint = useBreakpoint();
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const itemsPerSlide = useMemo(() => {
    if (isMobileOrMobileLarge) {
      return 1;
    } else if (breakpoint === size.tablet) {
      return 2;
    }
    return 3;
  }, [breakpoint, isMobileOrMobileLarge]);

  const slideContent = useMemo(() => {
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerSlide) {
      const row = profiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledProfileSet gap={16}>
          {row.map((profile) => (
            <FeaturedProfile key={profile.id} profile={profile} />
          ))}
          {row.length < itemsPerSlide && <StyledPlaceholder />}
        </StyledProfileSet>
      );

      rows.push(rowElements);
    }

    return rows;
  }, [itemsPerSlide, profiles]);
  return (
    <StyledContainer gap={16}>
      <Carousel slideContent={slideContent} />
    </StyledContainer>
  );
}

const StyledProfileSet = styled(HStack)`
  width: 100%;
`;

const StyledContainer = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    overflow-x: hidden;
  }
`;

const StyledPlaceholder = styled.div`
  width: 100%;
`;

type FeaturedProfileProps = {
  profile: CmsTypes.FeaturedProfile;
  size: 'sm' | 'lg';
};

export function FeaturedProfile({ profile, size = 'lg' }: FeaturedProfileProps) {
  return (
    <StyledLinkWrapper
      href={`/${profile.username}`}
      target="_blank"
      eventElementId="Landing Page Featured User"
      eventName="Clicked Landing Page Featured User"
      properties={{ username: profile.username }}
    >
      <StyledProfile gap={16}>
        <HStack gap={4}>
          {profile.coverImages.map((image) => (
            <StyledImageContainer key={image.asset.url}>
              <StyledImage key={image.asset.url} src={image.asset.url} />
            </StyledImageContainer>
          ))}
        </HStack>
        <VStack gap={4}>
          <HStack gap={4} align="center" justify="space-between">
            <HStack gap={6} align="center">
              <StyledPfp src={profile.pfp?.asset.url} />
              <StyledUsername>{profile.username}</StyledUsername>
            </HStack>
            <StyledProfileType profileType={profile.profileType}>
              {profile.profileType}
            </StyledProfileType>
          </HStack>
          <StyledBio>{profile.bio}</StyledBio>
        </VStack>
      </StyledProfile>
    </StyledLinkWrapper>
  );
}

const StyledLinkWrapper = styled(GalleryLink)`
  width: 100%;
`;

const StyledProfile = styled(VStack)`
  width: 100%;
  background-color: ${colors.faint};
  padding: 16px;
  border-radius: 16px;
  transition: background-color ${transitions.cubic};
  @media only screen and ${breakpoints.desktop} {
    min-width: 436px;
    max-width: 436px;
  }

  &:hover {
    background-color: ${colors.porcelain};
  }
`;

const StyledPfp = styled.img`
  height: 34px;
  width: 34px;
  border-radius: 50%;
`;

const StyledImageContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledUsername = styled(BaseM)`
  font-weight: 700;
  font-size: 18px;
`;

const StyledBio = styled(BaseM)`
  height: 20px; // fix height to get consistent spacing across profiles even if bio is not present
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const StyledProfileType = styled(TitleXS)<{ profileType: string }>`
  text-transform: uppercase;
  border: 1px solid
    ${({ profileType }) => (profileType === 'creator' ? '#30AC48' : colors.activeBlue)};
  border-radius: 24px;
  padding: 3px 11px;
  color: ${({ profileType }) => (profileType === 'creator' ? '#30AC48' : colors.activeBlue)};
`;
