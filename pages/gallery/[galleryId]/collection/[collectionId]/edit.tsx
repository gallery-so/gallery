import { useCallback, useState } from 'react';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import CollectionWizardContext from 'contexts/wizard/CollectionWizardContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import CollectionEditor from 'flows/../../src/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { WizardFooter } from 'components/WizardFooter';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import useUpdateCollectionTokens from 'hooks/api/collections/useUpdateCollectionTokens';
import { useToastActions } from 'contexts/toast/ToastContext';
import { editCollectionQuery } from '../../../../../__generated__/editCollectionQuery.graphql';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  galleryId: string;
  collectionId: string;
};

function LazyLoadedCollectionEditor({ galleryId, collectionId }: Props) {
  const query = useLazyLoadQuery<editCollectionQuery>(
    graphql`
      query editCollectionQuery {
        ...CollectionEditorFragment
      }
    `,
    {}
  );

  const { pushToast } = useToastActions();
  const updateCollection = useUpdateCollectionTokens();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();

  const { back, replace } = useRouter();

  const editGalleryUrl = `/gallery/${galleryId}/edit`;

  const canGoBack = useCanGoBack();
  const handlePrevious = useCallback(() => {
    if (canGoBack) {
      back();
    } else {
      replace(editGalleryUrl);
    }
  }, [back, canGoBack, editGalleryUrl, replace]);

  const handleNext = useCallback(async () => {
    try {
      await updateCollection({
        collectionId,
        stagedCollection: stagedCollectionState,
        tokenSettings: collectionMetadata.tokenSettings,
      });

      handlePrevious();
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
    collectionId,
    collectionMetadata.tokenSettings,
    handlePrevious,
    pushToast,
    stagedCollectionState,
    updateCollection,
  ]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  return (
    <VStack>
      <FullPageStep withFooter>
        <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />
      </FullPageStep>

      <WizardFooter
        isNextEnabled={isCollectionValid}
        nextText={'Save'}
        onNext={handleNext}
        onPrevious={handlePrevious}
        previousText="Cancel"
      />
    </VStack>
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
