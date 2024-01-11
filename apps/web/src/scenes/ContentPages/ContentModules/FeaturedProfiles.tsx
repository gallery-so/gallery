import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeaturedProfilesProps = {
  profiles: CmsTypes.FeaturedProfile[];
};

export default function FeaturedProfiles({ profiles }: FeaturedProfilesProps) {
  const slideContent = useMemo(() => {
    const itemsPerRow = 3;
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerRow) {
      const row = profiles.slice(i, i + itemsPerRow);
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
  }, [profiles]);
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
  return (
    <GalleryLink href={`/${profile.username}`} target="_blank">
      <StyledProfile gap={16}>
        <HStack gap={4}>
          {profile.coverImages.map((image) => (
            <StyledImage key={image.asset.url} src={image.asset.url} />
          ))}
        </HStack>
        <VStack gap={4}>
          <StyledUsername>{profile.username}</StyledUsername>
          <StyledProfileType>{profile.profileType}</StyledProfileType>
        </VStack>
      </StyledProfile>
    </GalleryLink>
  );
}

const StyledProfile = styled(VStack)`
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    min-width: 436px;
    max-width: 436px;
  }
  background-color: ${colors.faint};
  padding: 16px;
`;

const StyledUsername = styled(BaseM)`
  font-weight: 700;
  font-size: 18px;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
`;

const StyledProfileType = styled(BaseM)`
  text-transform: capitalize;
`;
