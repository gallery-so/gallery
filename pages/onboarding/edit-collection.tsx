import { useCallback, useMemo, useState } from 'react';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import CollectionWizardContext from 'contexts/wizard/CollectionWizardContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import CollectionEditor from 'flows/../../src/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import useUpdateCollectionTokens from 'hooks/api/collections/useUpdateCollectionTokens';
import { useToastActions } from 'contexts/toast/ToastContext';
import FullPageStep from 'components/Onboarding/FullPageStep';
import { getStepUrl } from 'components/Onboarding/constants';
import { editCollectionOnboardingQuery } from '../../__generated__/editCollectionOnboardingQuery.graphql';
import { UrlObject } from 'url';
import { useModalActions } from 'contexts/modal/ModalContext';
import GenericActionModal from 'scenes/Modals/GenericActionModal';
import { OnboardingCollectionEditorNavbar } from 'contexts/globalLayout/GlobalNavbar/OnboardingCollectionEditorNavbar/OnboardingCollectionEditorNavbar';

type Props = {
  collectionId: string;
};

function LazyLoadedCollectionEditorOnboarding({ collectionId }: Props) {
  const query = useLazyLoadQuery<editCollectionOnboardingQuery>(
    graphql`
      query editCollectionOnboardingQuery($collectionId: DBID!) {
        collectionById(id: $collectionId) {
          ... on Collection {
            gallery {
              dbid
            }
          }
        }
        ...CollectionEditorFragment
        ...OnboardingCollectionEditorNavbarFragment
      }
    `,
    { collectionId }
  );

  const { pushToast } = useToastActions();
  const { showModal } = useModalActions();
  const updateCollection = useUpdateCollectionTokens();
  const stagedCollectionState = useStagedCollectionState();
  const collectionMetadata = useCollectionMetadataState();

  const { back, replace, query: urlQuery } = useRouter();

  const returnUrl: UrlObject = useMemo(() => {
    // We want to pull out the query params relevant to this page
    // so we can navigate back to the old page without extra params.
    const nextParams = { ...urlQuery };
    delete nextParams.collectionId;

    return {
      pathname: getStepUrl('organize-gallery'),
      query: nextParams,
    };
  }, [urlQuery]);

  const handleNext = useCallback(async () => {
    try {
      await updateCollection({
        collectionId,
        stagedCollection: stagedCollectionState,
        tokenSettings: collectionMetadata.tokenSettings,
      });

      replace(returnUrl);
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
    pushToast,
    replace,
    returnUrl,
    stagedCollectionState,
    updateCollection,
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
              replace(returnUrl);
            }
          }}
        />
      ),
      headerText: 'Would you like to stop editing?',
    });
  }, [back, canGoBack, replace, returnUrl, showModal]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  return (
    <FullPageStep
      withBorder
      navbar={
        <OnboardingCollectionEditorNavbar
          isCollectionValid={isCollectionValid}
          onBack={handlePrevious}
          onNext={handleNext}
          queryRef={query}
        />
      }
    >
      <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />
    </FullPageStep>
  );
}

export default function OrganizeCollectionOnboardingWithProvider({ collectionId }: Props) {
  return (
    <CollectionWizardContext initialCollectionId={collectionId}>
      <CollectionEditorProvider>
        <LazyLoadedCollectionEditorOnboarding collectionId={collectionId} />
      </CollectionEditorProvider>
    </CollectionWizardContext>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (Array.isArray(query.collectionId)) {
    throw new Error('Tried to edit a collection with multiple collection ids the url.');
  }

  if (!query.collectionId) {
    throw new Error('Tried to edit  collection without a collection set.');
  }

  return {
    props: {
      collectionId: query.collectionId,
    },
  };
};
