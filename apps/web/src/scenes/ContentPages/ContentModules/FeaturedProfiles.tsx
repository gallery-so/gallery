import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeaturedProfilesProps = {
  profiles: CmsTypes.FeaturedProfile[];
};

export default function FeaturedProfiles({ profiles }: FeaturedProfilesProps) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const slideContent = useMemo(() => {
    const itemsPerSlide = isMobile ? 1 : 3;
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerSlide) {
      const row = profiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledProfileSet gap={16}>
          {row.map((profile) => (
            <FeaturedProfile key={profile.id} profile={profile} />
          ))}
        </StyledProfileSet>
      );

      rows.push(rowElements);
    }

    return rows;
  }, [isMobile, profiles]);
  return (
    <StyledContainer gap={16}>
      <Carousel slideContent={slideContent} />
    </StyledContainer>
  );
}

const StyledProfileSet = styled(HStack)`
  width: fit-content;
`;

const StyledContainer = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    overflow-x: hidden;
  }
`;

type FeaturedProfileProps = {
  profile: CmsTypes.FeaturedProfile;
};

function FeaturedProfile({ profile }: FeaturedProfileProps) {
  console.log(profile.pfp);
  return (
    <GalleryLink href={`/${profile.username}`} target="_blank">
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
    </GalleryLink>
  );
}

const StyledProfile = styled(VStack)`
  width: 100%;
  background-color: ${colors.faint};
  padding: 16px;
  border-radius: 16px;
  @media only screen and ${breakpoints.tablet} {
    min-width: 436px;
    max-width: 436px;
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
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
`;

const StyledProfileType = styled(TitleXS)<{ profileType: string }>`
  text-transform: uppercase;
  border: 1px solid
    ${({ profileType }) => (profileType === 'creator' ? '#30AC48' : colors.activeBlue)};
  border-radius: 24px;
  padding: 3px 11px;
  color: ${({ profileType }) => (profileType === 'creator' ? '#30AC48' : colors.activeBlue)};
`;
