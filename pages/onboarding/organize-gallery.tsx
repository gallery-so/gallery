import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { OrganizeGallery } from 'components/ManageGallery/OrganizeGallery/OrganizeGallery';
import { organizeGalleryQuery } from '../../__generated__/organizeGalleryQuery.graphql';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import { getStepUrl } from 'components/Onboarding/constants';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { OnboardingGalleryEditorNavbar } from 'contexts/globalLayout/GlobalNavbar/OnboardingGalleryEditorNavbar/OnboardingGalleryEditorNavbar';

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
      pathname: getStepUrl('organize-collection'),
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleEditCollection = useCallback(
    (dbid: string) => {
      push({
        pathname: getStepUrl('edit-collection'),
        query: { ...urlQuery, collectionId: dbid },
      });
    },
    [push, urlQuery]
  );

  const handleNext = useCallback(() => {
    return push({ pathname: getStepUrl('congratulations'), query: { ...urlQuery } });
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
