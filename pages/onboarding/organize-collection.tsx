import { useCallback, useState } from 'react';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedCollectionState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import CollectionWizardContext from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useLazyLoadQuery } from 'react-relay';
import { OrganizeCollectionQuery } from '__generated__/OrganizeCollectionQuery.graphql';
import CollectionCreateOrEditForm from 'flows/shared/steps/OrganizeCollection/CollectionCreateOrEditForm';
import CollectionEditor from 'flows/shared/steps/OrganizeCollection/Editor/CollectionEditor';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { OnboardingFooter } from 'flows/shared/components/WizardFooter/OnboardingFooter';
import { useRouter } from 'next/router';
import { getStepUrl } from 'flows/shared/components/WizardFooter/constants';
import { organizeCollectionQuery } from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { GetServerSideProps } from 'next';

function LazyLoadedCollectionEditor() {
  const query = useLazyLoadQuery<OrganizeCollectionQuery>(organizeCollectionQuery, {});

  if (query.viewer.__typename !== 'Viewer') {
    throw new Error(
      `OrganizeCollection expected Viewer to be type 'Viewer' but got: ${query.viewer.__typename}`
    );
  }

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
            push(getStepUrl('organize-gallery'), { query: { ...urlQuery } });
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
  return {
    props: {
      collectionId: params?.collectionId ?? null,
    },
  };
};
