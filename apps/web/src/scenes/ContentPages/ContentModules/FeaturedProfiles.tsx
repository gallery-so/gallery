import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type FeaturedProfilesProps = {
  profiles: CmsTypes.FeaturedProfile[];
};

export default function FeaturedProfiles({ profiles }: FeaturedProfilesProps) {
  return (
    <StyledContainer gap={16}>
      {profiles.map((profile) => (
        <FeaturedProfile key={profile.id} profile={profile} />
      ))}
    </StyledContainer>
  );
}

const StyledContainer = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

type FeaturedProfileProps = {
  profile: CmsTypes.FeaturedProfile;
};

function FeaturedProfile({ profile }: FeaturedProfileProps) {
  console.log({ profile });
  return (
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
