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
import { GetServerSideProps } from 'next';
import { WizardFooter } from 'components/WizardFooter';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { createCollectionQuery } from '../../../../__generated__/createCollectionQuery.graphql';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { CollectionCreateNavbar } from 'contexts/globalLayout/GlobalNavbar/CollectionCreateNavbar/CollectionCreateNavbar';
import GenericActionModal from 'scenes/Modals/GenericActionModal';

type Props = {
  galleryId: string;
};

function LazyLoadedCollectionEditor({ galleryId }: Props) {
  const query = useLazyLoadQuery<createCollectionQuery>(
    graphql`
      query createCollectionQuery {
        ...CollectionEditorFragment
      }
    `,
    {}
  );

  const track = useTrack();
  const { showModal } = useModalActions();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();

  const { push, back, replace } = useRouter();

  const editGalleryUrl = `/gallery/${galleryId}/edit`;

  const handleNext = useCallback(() => {
    track('Save new collection button clicked');

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={() => {
            push({
              pathname: editGalleryUrl,
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
    editGalleryUrl,
    galleryId,
    push,
    showModal,
    stagedCollectionState,
    track,
  ]);

  const canGoBack = useCanGoBack();
  const handlePrevious = useCallback(() => {
    showModal({
      content: (
        <GenericActionModal
          buttonText="Leave"
          action={() => {
            if (canGoBack) {
              back();
            } else {
              replace(editGalleryUrl);
            }
          }}
        />
      ),
      headerText: 'Would you like to stop editing?',
    });
  }, [back, canGoBack, editGalleryUrl, replace, showModal]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  return (
    <FullPageStep
      withBorder
      navbar={
        <CollectionCreateNavbar
          onBack={handlePrevious}
          onNext={handleNext}
          isCollectionValid={isCollectionValid}
        />
      }
    >
      <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />
    </FullPageStep>
  );
}

export default function OrganizeCollectionWithProvider({ galleryId }: Props) {
  return (
    <CollectionWizardContext>
      <CollectionEditorProvider>
        <LazyLoadedCollectionEditor galleryId={galleryId} />
      </CollectionEditorProvider>
    </CollectionWizardContext>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (Array.isArray(query.galleryId)) {
    throw new Error('Tried to create a new collection with multiple gallery ids in the url.');
  }

  if (!query.galleryId) {
    throw new Error('Tried to create a new collection without a gallery set.');
  }

  return {
    props: {
      galleryId: query.galleryId,
    },
  };
};
