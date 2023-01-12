import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { OrganizeGallery } from '~/components/ManageGallery/OrganizeGallery/OrganizeGallery';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { OnboardingGalleryEditorNavbar } from '~/contexts/globalLayout/GlobalNavbar/OnboardingGalleryEditorNavbar/OnboardingGalleryEditorNavbar';
import { organizeGalleryQuery } from '~/generated/organizeGalleryQuery.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

export default function OrganizeGalleryPage() {
  const query = useLazyLoadQuery<organizeGalleryQuery>(
    graphql`
      query organizeGalleryQuery {
        viewer {
          ... on Viewer {
            user {
              galleries {
                id
              }
            }
          }
        }

        ...OrganizeGalleryFragment
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const { push, query: urlQuery, back } = useRouter();
  const handleAddCollection = useCallback(() => {
    push({
      pathname: '/onboarding/organize-collection',
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleEditCollection = useCallback(
    (dbid: string) => {
      push({
        pathname: '/onboarding/edit-collection',
        query: { ...urlQuery, collectionId: dbid },
      });
    },
    [push, urlQuery]
  );

  const isEmailFeatureEnabled = isFeatureEnabled(FeatureFlag.EMAIL, query);

  const handleNext = useCallback(() => {
    const pathname = isEmailFeatureEnabled
      ? '/onboarding/add-email'
      : '/onboarding/congratulations';
    return push({ pathname, query: { ...urlQuery } });
  }, [isEmailFeatureEnabled, push, urlQuery]);

  const galleryId = query.viewer?.user?.galleries?.[0]?.id;

  return (
    <FullPageStep navbar={<OnboardingGalleryEditorNavbar onBack={back} onNext={handleNext} />}>
      <OrganizeGallery
        galleryId={galleryId}
        queryRef={query}
        onAddCollection={handleAddCollection}
        onEditCollection={handleEditCollection}
      />
    </FullPageStep>
  );
}
