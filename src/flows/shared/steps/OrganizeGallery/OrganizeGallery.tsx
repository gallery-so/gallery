import { useCallback, useState, useEffect } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import Header from './Header';
import CollectionDnd from './CollectionDnd';
import { useAuthenticatedUser } from 'hooks/api/useUser';
import { User } from 'types/User';
import useGalleries from 'hooks/api/useGalleries';

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

function OrganizeGallery() {
  const user = useAuthenticatedUser() as User;

  const returnToProfile = useCallback(() => {
    navigate(`/${user.username}`);
  }, [user.username]);

  const saveGalleryAndReturnToProfile = useCallback(() => {
    // Save gallery changes (re-ordered collections)
    navigate(`/${user.username}`);
  }, [user.username]);

  useWizardConfig({
    onNext: saveGalleryAndReturnToProfile,
    onPrevious: returnToProfile,
  });

  const galleries = useGalleries({ userId: user.id }) || [];
  // TODO: handle if galleries array is empty
  const gallery = galleries[0] || { collections: [] };

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionDnd collections={gallery.collections}></CollectionDnd>
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
