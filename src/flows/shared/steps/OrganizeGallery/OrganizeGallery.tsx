import { useCallback, useEffect } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import CollectionDnd from './CollectionDnd';
import Header from './Header';
import { User } from 'types/User';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';

type ConfigProps = {
  onNext: () => void;
  onPrevious: () => void;
};

function useWizardConfig({ onNext, onPrevious }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);
    setOnPrevious(onPrevious);

    return () => {
      setOnNext(undefined);
      setOnPrevious(undefined);
    };
  }, [setOnPrevious, onPrevious, setOnNext, onNext]);
}

function OrganizeGallery({ next }: WizardContext) {
  const wizardId = useWizardId();
  const user = useAuthenticatedUser() as User;

  const returnToProfile = useCallback(() => {
    navigate(`/${user.username}`);
  }, [user.username]);

  const saveGalleryAndReturnToProfile = useCallback(() => {
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      next();
      return;
    }
    navigate(`/${user.username}`);
  }, [next, user.username, wizardId]);

  useWizardConfig({
    onNext: saveGalleryAndReturnToProfile,
    onPrevious: returnToProfile,
  });

  const { collections } = useAuthenticatedGallery();

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionDnd collections={collections} />
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
