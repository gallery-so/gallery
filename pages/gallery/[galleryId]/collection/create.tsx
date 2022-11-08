import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import CollectionCreateOrEditForm from '~/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import CollectionEditor from '~/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import { CollectionCreateNavbar } from '~/contexts/globalLayout/GlobalNavbar/CollectionCreateNavbar/CollectionCreateNavbar';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import CollectionWizardContext from '~/contexts/wizard/CollectionWizardContext';
import { createCollectionQuery } from '~/generated/createCollectionQuery.graphql';
import GenericActionModal from '~/scenes/Modals/GenericActionModal';

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

  const editGalleryUrl = useMemo<Route>(
    () => ({ pathname: '/gallery/[galleryId]/edit', query: { galleryId } }),
    [galleryId]
  );

  const handleNext = useCallback(() => {
    track('Save new collection button clicked');

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={() => {
            push(editGalleryUrl);
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
          galleryId={galleryId}
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
