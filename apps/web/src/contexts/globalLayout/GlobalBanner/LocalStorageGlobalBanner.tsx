import { useCallback } from 'react';

import { GlobalBanner } from '~/components/core/GlobalBanner/GlobalBanner';
import { UserExperienceType } from '~/generated/enums';
import usePersistedState from '~/hooks/usePersistedState';

export function LocalStorageGlobalBanner() {
  const [bannerDismissed, setBannerDismissed] = usePersistedState(
    'Nov2023SurveyBannerDismissed',
    false
  );

  const handleClose = useCallback(() => {
    setBannerDismissed(true);
  }, [setBannerDismissed]);

  const handleClick = useCallback(() => {
    window.open('https://form.typeform.com/to/Liu8fMUk', '_blank');
  }, []);

  if (bannerDismissed) {
    return null;
  }

  return (
    <GlobalBanner
      description="Help us make Gallery better for everyone — and potentially win $100. Share your feedback in our user survey before 11:59pm Dec 3 ET to enter."
      onClose={handleClose}
      onClick={handleClick}
      ctaText="Take Survey"
      experienceFlag={'Nov2023Survey' as UserExperienceType}
      bannerVariant="default"
    />
  );
}
