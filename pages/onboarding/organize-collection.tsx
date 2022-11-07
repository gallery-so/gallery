import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import CollectionCreateOrEditForm from '~/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import CollectionEditor from '~/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { OnboardingCollectionCreateNavbar } from '~/contexts/globalLayout/GlobalNavbar/OnboardingCollectionCreateNavbar/OnboardingCollectionCreateNavbar';
import { useModalActions } from '~/contexts/modal/ModalContext';
import CollectionWizardContext from '~/contexts/wizard/CollectionWizardContext';
import formatError from '~/errors/formatError';
import { organizeCollectionPageQuery } from '~/generated/organizeCollectionPageQuery.graphql';
import useCreateCollection from '~/hooks/api/collections/useCreateCollection';
import { getTokenIdsFromCollection } from '~/utils/collectionLayout';
import noop from '~/utils/noop';

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
  const reportError = useReportError();
  const [generalError, setGeneralError] = useState('');

  const { showModal } = useModalActions();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();
  const createCollection = useCreateCollection();

  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  const hasShownAddCollectionNameAndDescriptionModal = useRef(false);

  const { push, query: urlQuery, back, replace } = useRouter();

  const handleNext = useCallback(
    async (caption: string) => {
      track('Save new collection button clicked');

      const title = collectionTitle;
      const description = collectionDescription;

      try {
        track('Create collection', {
          added_name: title.length > 0,
          added_description: description.length > 0,
          nft_ids: getTokenIdsFromCollection(stagedCollectionState),
          caption: caption.length > 0,
        });

        const response = await createCollection({
          galleryId,
          title,
          description,
          stagedCollection: stagedCollectionState,
          tokenSettings: collectionMetadata.tokenSettings,
          caption,
        });

        if (
          response.createCollection?.__typename === 'CreateCollectionPayload' &&
          response.createCollection.collection
        ) {
          const collectionId = response.createCollection.collection.dbid;
          // Replace the current route with the "edit-collection" route
          // so if the user hits the back button, they'll rightfully
          // be editing a collection instead of creating another one.
          await replace({
            pathname: '/onboarding/edit-collection',
            query: { ...urlQuery, collectionId },
          });

          await push({
            pathname: '/onboarding/organize-gallery',
            query: { ...urlQuery },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
          setGeneralError(formatError(error));
        }

        reportError('Something unexpected occurred while trying to update a collection', {
          tags: {
            title,
            galleryId,
            description,
          },
        });
      }
    },
    [
      collectionTitle,
      collectionDescription,
      collectionMetadata.tokenSettings,
      createCollection,
      galleryId,
      push,
      replace,
      reportError,
      stagedCollectionState,
      track,
      urlQuery,
    ]
  );

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  useEffect(() => {
    if (hasShownAddCollectionNameAndDescriptionModal.current) return;

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={({ title, description }) => {
            setCollectionTitle(title ?? '');
            setCollectionDescription(description ?? '');
          }}
          galleryId={galleryId}
          stagedCollection={stagedCollectionState}
          tokenSettings={collectionMetadata.tokenSettings}
        />
      ),
      headerText: 'Name and describe your collection',
    });

    hasShownAddCollectionNameAndDescriptionModal.current = true;
  }, [showModal, stagedCollectionState, collectionMetadata.tokenSettings, galleryId, push]);

  return (
    <FullPageStep
      withBorder
      navbar={
        <OnboardingCollectionCreateNavbar
          onBack={back}
          onNext={handleNext}
          isCollectionValid={isCollectionValid}
          collectionName={collectionTitle}
          error={generalError}
        />
      }
    >
      <CollectionEditor
        queryRef={query}
        onValidChange={setIsCollectionValid}
        onHasUnsavedChange={noop}
      />
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
