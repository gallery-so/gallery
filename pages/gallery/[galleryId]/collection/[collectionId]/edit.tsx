import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import CollectionEditor from '~/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import { CollectionEditorNavbar } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorNavbar';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { useToastActions } from '~/contexts/toast/ToastContext';
import CollectionWizardContext from '~/contexts/wizard/CollectionWizardContext';
import { editCollectionQuery } from '~/generated/editCollectionQuery.graphql';
import useUpdateCollectionTokens from '~/hooks/api/collections/useUpdateCollectionTokens';
import GenericActionModal from '~/scenes/Modals/GenericActionModal';

type Props = {
  galleryId: string;
  collectionId: string;
};

function LazyLoadedCollectionEditor({ galleryId, collectionId }: Props) {
  const query = useLazyLoadQuery<editCollectionQuery>(
    graphql`
      query editCollectionQuery($collectionId: DBID!) {
        ...CollectionEditorFragment
        ...CollectionEditorNavbarFragment
        ...GalleryAuthenticatedRouteFragment
      }
    `,
    { collectionId }
  );

  const { showModal } = useModalActions();
  const { pushToast } = useToastActions();
  const updateCollection = useUpdateCollectionTokens();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();

  const { back, replace } = useRouter();

  const editGalleryUrl = useMemo<Route>(
    () => ({ pathname: '/gallery/[galleryId]/edit', query: { galleryId } }),
    [galleryId]
  );

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

  const handleNext = useCallback(async (caption: string) => {
    try {
      await updateCollection({
        collectionId,
        stagedCollection: stagedCollectionState,
        tokenSettings: collectionMetadata.tokenSettings,
        caption,
      });

      if (canGoBack) {
        back();
      } else {
        replace(editGalleryUrl);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        pushToast({
          message:
            'There was an error updating your collection. If the issue persists, please contact us on Discord.',
        });

        return;
      }
    }
  }, [
    back,
    canGoBack,
    collectionId,
    collectionMetadata.tokenSettings,
    editGalleryUrl,
    pushToast,
    replace,
    stagedCollectionState,
    updateCollection,
  ]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);
  const [hasUnsavedChange, setHasUnsavedChange] = useState(false);

  return (
    <FullPageStep
      navbar={
        <CollectionEditorNavbar
          galleryId={galleryId}
          isCollectionValid={isCollectionValid}
          hasUnsavedChange={hasUnsavedChange}
          onDone={handleNext}
          onCancel={handlePrevious}
          queryRef={query}
        />
      }
      withBorder
    >
      <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} onHasUnsavedChange={setHasUnsavedChange}/>
    </FullPageStep>
  );
}

export default function OrganizeCollectionWithProvider({ galleryId, collectionId }: Props) {
  return (
    <CollectionWizardContext initialCollectionId={collectionId}>
      <CollectionEditorProvider>
        <LazyLoadedCollectionEditor collectionId={collectionId} galleryId={galleryId} />
      </CollectionEditorProvider>
    </CollectionWizardContext>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (Array.isArray(query.galleryId)) {
    throw new Error('Tried to edit a collection with multiple gallery ids in the url.');
  }

  if (!query.galleryId) {
    throw new Error('Tried to edit a collection without a gallery set.');
  }

  if (Array.isArray(query.collectionId)) {
    throw new Error('Tried to edit a collection with multiple collection ids the url.');
  }

  if (!query.collectionId) {
    throw new Error('Tried to edit  collection without a collection set.');
  }

  return {
    props: {
      galleryId: query.galleryId,
      collectionId: query.collectionId,
    },
  };
};
