import { useCallback, useState } from 'react';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import CollectionWizardContext from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { OrganizeCollectionQuery } from '__generated__/OrganizeCollectionQuery.graphql';
import CollectionCreateOrEditForm from 'flows/../../src/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import CollectionEditor from 'flows/../../src/components/ManageGallery/OrganizeCollection/Editor/CollectionEditor';
import FullPageCenteredStep from 'flows/../../src/components/Onboarding/FullPageCenteredStep/FullPageCenteredStep';
import { OnboardingFooter } from 'flows/../../src/components/Onboarding/WizardFooter/OnboardingFooter';
import { useRouter } from 'next/router';
import { getStepUrl } from 'flows/../../src/components/Onboarding/WizardFooter/constants';
import { GetServerSideProps } from 'next';

function LazyLoadedCollectionEditor() {
  const query = useLazyLoadQuery<OrganizeCollectionQuery>(
    graphql`
      query OrganizeCollectionQuery {
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

  const { push, query: urlQuery, back } = useRouter();
  const handleNext = useCallback(() => {
    track('Save new collection button clicked');

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={() => {
            push({
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
    showModal,
    stagedCollectionState,
    track,
    urlQuery,
  ]);

  const [isCollectionValid, setIsCollectionValid] = useState(false);

  return (
    <FullPageCenteredStep>
      <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />;
      <OnboardingFooter
        step={'organize-collection'}
        onNext={handleNext}
        isNextEnabled={isCollectionValid}
        onPrevious={back}
      />
    </FullPageCenteredStep>
  );
}

type Props = {
  collectionId: string | null;
};

export default function OrganizeCollectionWithProvider({ collectionId }: Props) {
  return (
    <CollectionWizardContext initialCollectionId={collectionId ?? undefined}>
      <CollectionEditorProvider>
        <LazyLoadedCollectionEditor />
      </CollectionEditorProvider>
    </CollectionWizardContext>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  if (Array.isArray(params?.collectionId)) {
    return {
      props: {
        collectionId: null,
      },
    };
  }

  return {
    props: {
      collectionId: params?.collectionId ?? null,
    },
  };
};
