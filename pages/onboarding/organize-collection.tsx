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
import { organizeCollectionPageQuery } from '../../__generated__/organizeCollectionPageQuery.graphql';
import { getStepUrl } from 'components/Onboarding/constants';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import { VStack } from 'components/core/Spacer/Stack';
import FullPageStep from 'components/Onboarding/FullPageStep';

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
    <VStack>
      <FullPageStep withFooter>
        <CollectionEditor queryRef={query} onValidChange={setIsCollectionValid} />;
      </FullPageStep>

      <OnboardingFooter
        step={'organize-collection'}
        onNext={handleNext}
        isNextEnabled={isCollectionValid}
        onPrevious={back}
      />
    </VStack>
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
