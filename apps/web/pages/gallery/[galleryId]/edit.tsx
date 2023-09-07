import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  BETA_ANNOUNCEMENT_STORAGE_KEY,
  BetaAnnouncementModal,
} from '~/components/GalleryEditor/BetaAnnouncementModal';
import { GalleryEditor } from '~/components/GalleryEditor/GalleryEditor';
import {
  GalleryEditorProvider,
  useGalleryEditorContext,
} from '~/components/GalleryEditor/GalleryEditorContext';
import {
  OnboardingDialogProvider,
  useOnboardingDialogContext,
} from '~/components/GalleryEditor/GalleryOnboardingGuide/OnboardingDialogContext';
import useConfirmationMessageBeforeClose from '~/components/ManageGallery/useConfirmationMessageBeforeClose';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { EditGalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/EditGalleryNavbar/EditGalleryNavbar';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { editGalleryPageNewInnerFragment$key } from '~/generated/editGalleryPageNewInnerFragment.graphql';
import { editGalleryPageNewQuery } from '~/generated/editGalleryPageNewQuery.graphql';
import { useGuardEditorUnsavedChanges } from '~/hooks/useGuardEditorUnsavedChanges';
import usePersistedState from '~/hooks/usePersistedState';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

type EditGalleryPageInnerProps = {
  queryRef: editGalleryPageNewInnerFragment$key;
};

function EditGalleryPageInner({ queryRef }: EditGalleryPageInnerProps) {
  const query = useFragment(
    graphql`
      fragment editGalleryPageNewInnerFragment on Query {
        ...GalleryEditorFragment

        viewer {
          ... on Viewer {
            __typename
            user {
              username
              roles
            }
          }
        }
      }
    `,
    queryRef
  );

  const [dismissAnnouncement, setDismissAnnouncement] = usePersistedState(
    BETA_ANNOUNCEMENT_STORAGE_KEY,
    false
  );

  const { showModal } = useModalActions();
  const track = useTrack();
  const canGoBack = useCanGoBack();

  const { replace, back, route } = useRouter();
  const {
    saveGallery,
    hasSaved,
    canSave,
    hasUnsavedChanges,
    editGalleryNameAndDescription,
    name,
    publishGallery,
  } = useGalleryEditorContext();
  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  useConfirmationMessageBeforeClose(hasUnsavedChanges);

  const goBack = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.__typename === 'Viewer' && query.viewer.user?.username) {
      replace({
        pathname: '/[username]/galleries',
        query: { username: query.viewer.user.username },
      });
    } else {
      replace({ pathname: '/home' });
    }
  }, [back, canGoBack, query.viewer, replace]);

  const handleBack = useGuardEditorUnsavedChanges(goBack, hasUnsavedChanges);

  const [isSaving, setIsSaving] = useState(false);

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error('Viewer does not exist');
  }

  const user = query.viewer.user;

  const handleSave = useCallback(async () => {
    const userRoles = user?.roles ?? [];

    setIsSaving(true);
    await saveGallery();
    setIsSaving(false);

    // If the user is beta tester or admin or has dismissed the announcement, don't show the modal
    if (userRoles?.includes('BETA_TESTER') || userRoles?.includes('ADMIN') || dismissAnnouncement) {
      return;
    }

    track('Show Beta Announcement Modal');

    showModal({
      content: (
        <BetaAnnouncementModal
          onDismiss={() => {
            setDismissAnnouncement(true);
          }}
        />
      ),
      onClose: () => {
        setDismissAnnouncement(true);
      },
    });
  }, [dismissAnnouncement, user, saveGallery, setDismissAnnouncement, showModal, track]);

  const handleEdit = useCallback(() => {
    editGalleryNameAndDescription();
  }, [editGalleryNameAndDescription]);

  const handleDone = useCallback(
    async (caption: string, redirect?: boolean) => {
      await publishGallery(caption);

      if (redirect) {
        handleBack();
      }
    },
    [handleBack, publishGallery]
  );

  const username = query.viewer?.__typename === 'Viewer' ? query.viewer.user?.username : null;

  if (!username) {
    throw new Error('Username does not exist');
  }

  // ummm shouldn't need to do this but sometimes this component
  // renders when on another route?! this occurs when navigating
  // away from the editor
  if (route !== '/gallery/[galleryId]/edit') {
    return null;
  }

  return (
    <FullPageStep
      withBorder
      navbar={
        <EditGalleryNavbar
          onEdit={handleEdit}
          galleryName={name}
          canSave={canSave}
          hasSaved={hasSaved}
          username={username}
          hasUnsavedChanges={hasUnsavedChanges}
          onBack={handleBack}
          onSave={handleSave}
          onDone={handleDone}
          isSaving={isSaving}
          step={step}
          dialogMessage={dialogMessage}
          onNextStep={nextStep}
          dialogOnClose={handleClose}
        />
      }
    >
      <GalleryEditor queryRef={query} />
    </FullPageStep>
  );
}

type Props = {
  galleryId: string;
  initialCollectionId: string | null;
};

export default function EditGalleryPage({ galleryId, initialCollectionId }: Props) {
  const query = useLazyLoadQuery<editGalleryPageNewQuery>(
    graphql`
      query editGalleryPageNewQuery($galleryId: DBID!) {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...GalleryEditorContextFragment
        ...editGalleryPageNewInnerFragment
        ...OnboardingDialogContextFragment
      }
    `,
    { galleryId }
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  if (!isLoggedIn) {
    return <GalleryRedirect to={{ pathname: '/auth' }} />;
  }

  return (
    <GalleryEditorProvider initialCollectionId={initialCollectionId} queryRef={query}>
      <OnboardingDialogProvider queryRef={query}>
        <EditGalleryPageInner queryRef={query} />
      </OnboardingDialogProvider>
    </GalleryEditorProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  if (typeof params?.galleryId === 'string') {
    return {
      props: {
        galleryId: params.galleryId,
        initialCollectionId: typeof query?.collectionId === 'string' ? query.collectionId : null,
      },
    };
  }

  return { redirect: { permanent: false, destination: '/' } };
};
