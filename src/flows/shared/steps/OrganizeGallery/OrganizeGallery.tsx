import { useCallback, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import useUpdateGallery from 'hooks/api/galleries/useUpdateGallery';
import { Collection } from 'types/Collection';
import Mixpanel from 'utils/mixpanel';
import Header from './Header';
import CollectionDnd from './CollectionDnd';

type ConfigProps = {
  wizardId: string;
  username: string;
  galleryId: string;
  sortedCollections: Collection[];
  next: WizardContext['next'];
};

function useWizardConfig({
  wizardId,
  username,
  galleryId,
  sortedCollections,
  next,
}: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();
  const updateGallery = useUpdateGallery();

  const clearOnNext = useCallback(() => {
    setOnNext(undefined);
    setOnPrevious(undefined);
  }, [setOnNext, setOnPrevious]);

  const returnToProfile = useCallback(() => {
    void navigate(`/${username}`);
    clearOnNext();
  }, [clearOnNext, username]);

  const saveGalleryAndReturnToProfile = useCallback(async () => {
    clearOnNext();
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      Mixpanel.track('Publish gallery');
      next();
      return;
    }

    await updateGallery(galleryId, sortedCollections);
    void navigate(`/${username}`);
  }, [
    clearOnNext,
    galleryId,
    next,
    sortedCollections,
    updateGallery,
    username,
    wizardId,
  ]);

  useEffect(() => {
    setOnNext(saveGalleryAndReturnToProfile);
    setOnPrevious(returnToProfile);
  }, [
    setOnPrevious,
    setOnNext,
    saveGalleryAndReturnToProfile,
    returnToProfile,
  ]);
}

function OrganizeGallery({ next }: WizardContext) {
  const wizardId = useWizardId();
  const user = useAuthenticatedUser();

  const { id, collections } = useAuthenticatedGallery();
  const [sortedCollections, setSortedCollections] = useState(collections);

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

  return (
    <StyledOrganizeGallery>
      <Content>
        <Header />
        <Spacer height={24} />
        <CollectionDnd
          sortedCollections={sortedCollections}
          setSortedCollections={setSortedCollections}
        />
        <Spacer height={120} />
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledOrganizeGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

export default OrganizeGallery;
