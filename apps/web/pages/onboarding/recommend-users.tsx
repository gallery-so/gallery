import { Suspense } from 'react';

import { OnboardingRecommendUsersFallback } from '~/scenes/Onboarding/OnboardingRecommendUsersFallback';
import { OnboardingRecommendUsersPage } from '~/scenes/Onboarding/OnboardingRecommendUsersPage';

export default function RecommendUsers() {
  return (
    <Suspense fallback={<OnboardingRecommendUsersFallback />}>
      <OnboardingRecommendUsersPage />
    </Suspense>
  );
}
