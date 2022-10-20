import { useCallback, useState } from 'react';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import CollectionWizardContext from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import CollectionCreateOrEditForm from 'flows/../../src/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import CollectionEditor from 'flows/../../src/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import { useRouter } from 'next/router';
import { organizeCollectionPageQuery } from '../../__generated__/organizeCollectionPageQuery.graphql';
import { getStepUrl } from 'components/Onboarding/constants';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { OnboardingCollectionCreateNavbar } from '../../src/contexts/globalLayout/GlobalNavbar/OnboardingCollectionCreateNavbar/OnboardingCollectionCreateNavbar';

function LazyLoadedCollectionEditor() {
  const query = useLazyLoadQuery<organizeCollectionPageQuery>(
    graphql`
      query organizeCollectionPageQuery {
        viewer @required(action: THROW) {
          ... on Viewer {
            __typename
            user @required(action: THROW) {
              username
              galleries @required(action: THROW) {
                dbid @required(action: THROW)
              }
            }
          }
        }

        ...CollectionEditorFragment
      }
    `,
    {}
  );

  if (query.viewer.__typename !== 'Viewer') {
    throw new Error(
      `OrganizeCollection expected Viewer to be type 'Viewer' but got: ${query.viewer.__typename}`
    );
  }

  // We don't have to handle multi-gallery here since the user is
  // going through onboarding and we can assume they only have one gallery
  const galleryId = query.viewer.user.galleries[0]?.dbid;

  if (!galleryId) {
    throw new Error(`OrganizeCollection expected galleryId`);
  }

  const track = useTrack();
  const { showModal } = useModalActions();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();

  const { push, query: urlQuery, back, replace } = useRouter();
  const handleNext = useCallback(() => {
    track('Save new collection button clicked');

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={async (collectionId) => {
            // Replace the current route with the "edit-collection" route
            // so if the user hits the back button, they'll rightfully
            // be editing a collection instead of creating another one.
            await replace({
              pathname: getStepUrl('edit-collection'),
              query: { ...urlQuery, collectionId },
            });

            await push({
              pathname: getStepUrl('organize-gallery'),
              query: { ...urlQuery },
            });
          }}
          galleryId={galleryId}
          stagedCollection={stagedCollectionState}
          tokenSettings={collectionMetadata.tokenSettings}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [
    collectionMetadata.tokenSettings,
    galleryId,
    push,
    replace,
    showModal,
    stagedCollectionState,
    track,
    urlQuery,
  ]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  return (
    <FullPageStep
      withBorder
      navbar={
        <OnboardingCollectionCreateNavbar
          onBack={back}
          onNext={handleNext}
          isCollectionValid={isCollectionValid}
        />
      }
    >
      <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />
    </FullPageStep>
  );
}

export default function OrganizeCollectionWithProvider() {
  return (
    <CollectionWizardContext>
      <CollectionEditorProvider>
        <LazyLoadedCollectionEditor />
      </CollectionEditorProvider>
    </CollectionWizardContext>
  );
}
