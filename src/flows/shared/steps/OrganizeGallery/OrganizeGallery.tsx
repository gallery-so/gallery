import { useCallback, useEffect } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import CollectionDnd from './CollectionDnd';
import Header from './Header';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';

type ConfigProps = {
  wizardId: string;
  username: string;
  next: WizardContext['next'];
};

function useWizardConfig({ wizardId, username, next }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();

  const clearOnNext = useCallback(() => {
    setOnNext(undefined);
    setOnPrevious(undefined);
  }, [setOnNext, setOnPrevious]);

  const returnToProfile = useCallback(() => {
    navigate(`/${username}`);
    clearOnNext();
  }, [clearOnNext, username]);

  const saveGalleryAndReturnToProfile = useCallback(() => {
    clearOnNext();
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      next();
      return;
    }
    navigate(`/${username}`);
  }, [clearOnNext, next, username, wizardId]);

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

  useWizardConfig({
    wizardId,
    username: user.username,
    next,
  });

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={24} />
        <CollectionDnd />
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
