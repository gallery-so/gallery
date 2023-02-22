import { useEffect } from 'react';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleL } from '~/components/core/Text/Text';
import useUpdateUserExperience from '~/components/GalleryEditor/GalleryOnboardingGuide/useUpdateUserExperience';
import { UserExperienceType } from '~/generated/enums';

// This page allows users to reset their dismissed experience flags
export default function Secret() {
  const updateUserExperience = useUpdateUserExperience();
  
  const experiences: UserExperienceType[] = [
    'MultiGalleryAnnouncement',  'EmailUpsell',  'MerchStoreUpsell',  'MaintenanceFeb2023'
  ]
  useEffect(() => {
    experiences.forEach(experience => {
      updateUserExperience({
        type: experience,
        experienced: false,
      })
    })
  }, [updateUserExperience]);

  return (
    <StyledSecret gap={8}>
      <TitleL>You've found the secret page</TitleL>
    </StyledSecret>
  );
}

const StyledSecret = styled(VStack)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;
