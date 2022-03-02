import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { Collection } from 'types/Collection';
import { Filler } from 'scenes/_Router/GalleryRoute';
import { BodyRegular, Heading } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useToastActions } from 'contexts/toast/ToastContext';
import Header from './Header';
import CollectionDnd from './CollectionDnd';
import { useRouter } from 'next/router';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type ConfigProps = {
  wizardId: string;
  username: string;
  galleryId: string;
  sortedCollections: Collection[];
  next: WizardContext['next'];
};

function useNotOptimizedForMobileWarning() {
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (detectMobileDevice()) {
      pushToast(
        "This page isn't optimized for mobile yet. Please use a computer to organize your Gallery."
      );
    }
  }, [pushToast]);
}

function useWizardConfig({ wizardId, username, next }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();
  const canGoBack = useCanGoBack();

  const clearOnNext = useCallback(() => {
    setOnNext(undefined);
    setOnPrevious(undefined);
  }, [setOnNext, setOnPrevious]);

  const { replace, back, push } = useRouter();
  const returnToPrevious = useCallback(() => {
    if (canGoBack) {
      back();
    } else {
      void replace(`/${username}`);
    }

    clearOnNext();
  }, [canGoBack, clearOnNext, back, replace, username]);

  const track = useTrack();

  const saveGalleryAndReturnToProfile = useCallback(async () => {
    clearOnNext();
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      track('Publish gallery');
      next();
      return;
    }

    void push(`/${username}`);
  }, [clearOnNext, next, push, username, wizardId, track]);

  useEffect(() => {
    setOnNext(saveGalleryAndReturnToProfile);
    setOnPrevious(returnToPrevious);
  }, [setOnPrevious, setOnNext, saveGalleryAndReturnToProfile, returnToPrevious]);
}

function OrganizeGallery({ next, push }: WizardContext) {
  const wizardId = useWizardId();
  const user = useAuthenticatedUser();

  const { id, collections } = useAuthenticatedGallery();
  const [sortedCollections, setSortedCollections] = useState(collections);

  useNotOptimizedForMobileWarning();

  const router = useRouter();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();
  const collectionId = (router.query.collectionId as string) || null;

  useEffect(() => {
    if (collectionId) {
      setCollectionIdBeingEdited(collectionId);
      push('organizeCollection');
    }
  }, [collectionId, push, setCollectionIdBeingEdited]);

  useEffect(() => {
    // When the server sends down its source of truth, sync the local state
    setSortedCollections(collections);
  }, [collections]);

  useWizardConfig({
    wizardId,
    username: user.username,
    galleryId: id,
    sortedCollections,
    next,
  });

  const isEmptyGallery = useMemo(() => sortedCollections.length === 0, [sortedCollections.length]);

  return (
    <StyledOrganizeGallery>
      <Filler />
      <Content>
        <Header />
        <Spacer height={24} />
        {isEmptyGallery ? (
          <StyledEmptyGalleryMessage>
            <Heading>Create your first collection</Heading>
            <Spacer height={8} />
            <BodyRegular color={colors.gray50}>
              Organize your gallery with collections. Use them to group NFTs by creator, theme, or
              anything that feels right.
            </BodyRegular>
          </StyledEmptyGalleryMessage>
        ) : (
          <CollectionDnd
            galleryId={id}
            sortedCollections={sortedCollections}
            setSortedCollections={setSortedCollections}
          />
        )}
        <Spacer height={120} />
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledEmptyGalleryMessage = styled.div`
  text-align: center;
  max-width: 390px;
  margin: 240px auto 0;
`;

const StyledOrganizeGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

export default OrganizeGallery;
