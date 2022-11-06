import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { OrganizeGallery } from '~/components/ManageGallery/OrganizeGallery/OrganizeGallery';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { OnboardingGalleryEditorNavbar } from '~/contexts/globalLayout/GlobalNavbar/OnboardingGalleryEditorNavbar/OnboardingGalleryEditorNavbar';
import { organizeGalleryQuery } from '~/generated/organizeGalleryQuery.graphql';

export default function OrganizeGalleryPage() {
  const query = useLazyLoadQuery<organizeGalleryQuery>(
    graphql`
      query organizeGalleryQuery {
        ...OrganizeGalleryFragment
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

  const handleNext = useCallback(() => {
    return push({ pathname: '/onboarding/congratulations', query: { ...urlQuery } });
  }, [push, urlQuery]);

  return (
    <FullPageStep navbar={<OnboardingGalleryEditorNavbar onBack={back} onNext={handleNext} />}>
      <OrganizeGallery
        queryRef={query}
        onAddCollection={handleAddCollection}
        onEditCollection={handleEditCollection}
      />
    </FullPageStep>
  );
}
