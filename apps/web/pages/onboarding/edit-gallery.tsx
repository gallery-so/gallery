import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

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
import { OnboardingEditGalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/EditGalleryNavbar/OnboardingEditGalleryNavbar';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { editGalleryOnboardingInnerFragment$key } from '~/generated/editGalleryOnboardingInnerFragment.graphql';
import { editGalleryOnboardingQuery } from '~/generated/editGalleryOnboardingQuery.graphql';
import { useGuardEditorUnsavedChanges } from '~/hooks/useGuardEditorUnsavedChanges';

type EditGalleryInnerProps = {
  queryRef: editGalleryOnboardingInnerFragment$key;
};

function EditGalleryInner({ queryRef }: EditGalleryInnerProps) {
  const query = useFragment(
    graphql`
      fragment editGalleryOnboardingInnerFragment on Query {
        ...GalleryEditorFragment
      }
    `,
    queryRef
  );

  const canGoBack = useCanGoBack();
  const { replace, back, push } = useRouter();
  const { saveGallery, canSave, hasUnsavedChanges, editGalleryNameAndDescription, name } =
    useGalleryEditorContext();
  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  useConfirmationMessageBeforeClose(hasUnsavedChanges);

  const goBack = useCallback(() => {
    if (canGoBack) {
      back();
    } else {
      replace({
        pathname: '/onboarding/add-user-info',
      });
    }
  }, [back, canGoBack, replace]);

  const handleBack = useGuardEditorUnsavedChanges(goBack, hasUnsavedChanges);

  const handleDone = useCallback(async () => {
    await saveGallery(null);

    await push({ pathname: '/onboarding/add-email' });
  }, [push, saveGallery]);

  return (
    <FullPageStep
      withBorder
      navbar={
        <OnboardingEditGalleryNavbar
          canSave={canSave}
          hasUnsavedChanges={hasUnsavedChanges}
          galleryName={name}
          onEdit={editGalleryNameAndDescription}
          onBack={handleBack}
          onDone={handleDone}
          step={step}
          dialogMessage={dialogMessage}
          onNextStep={nextStep}
          dialogOnClose={handleClose}
        />
      }
    >
      <GalleryEditor queryRef={query} />;
    </FullPageStep>
  );
}

type Props = {
  galleryId: string;
};

export default function EditGallery({ galleryId }: Props) {
  const query = useLazyLoadQuery<editGalleryOnboardingQuery>(
    graphql`
      query editGalleryOnboardingQuery($galleryId: DBID!) {
        ...GalleryEditorFragment
        ...GalleryEditorContextFragment
        ...editGalleryOnboardingInnerFragment
        ...OnboardingDialogContextFragment
      }
    `,
    { galleryId }
  );

  return (
    <GalleryEditorProvider queryRef={query}>
      <OnboardingDialogProvider queryRef={query}>
        <EditGalleryInner queryRef={query} />
      </OnboardingDialogProvider>
    </GalleryEditorProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (!query.galleryId || typeof query.galleryId !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      galleryId: query.galleryId,
    },
  };
};
