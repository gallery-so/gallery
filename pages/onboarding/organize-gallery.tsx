import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { OrganizeGallery } from 'components/ManageGallery/OrganizeGallery/OrganizeGallery';
import { organizeGalleryQuery } from '../../__generated__/organizeGalleryQuery.graphql';
import FullPageCenteredStep from 'components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import { getStepUrl } from 'components/Onboarding/constants';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';

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
      pathname: getStepUrl('create'),
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleEditCollection = useCallback(() => {
    // TODO(Terence): Heavily test this
    // We need to make sure the flow of going back and forth between steps works.
    push({
      pathname: getStepUrl('organize-collection'),
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleNext = useCallback(() => {
    return push({ pathname: getStepUrl('congratulations'), query: { ...urlQuery } });
  }, [push, urlQuery]);

  return (
    <VStack>
      <FullPageStep withFooter>
        <OrganizeGallery
          queryRef={query}
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
        />
      </FullPageStep>

      <OnboardingFooter
        step="organize-gallery"
        onNext={handleNext}
        isNextEnabled={true}
        onPrevious={back}
      />
    </VStack>
  );
}
