import { useCallback, useState, useEffect } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { mockCollectionsLite } from 'mocks/collections';

import Spacer from 'components/core/Spacer/Spacer';
import Header from './Header';
import CollectionDnd from './CollectionDnd';

type ConfigProps = {
  onPrevious: () => void;
};

function useWizardConfig({ onPrevious }: ConfigProps) {
  const { setOnPrevious } = useWizardCallback();

  useEffect(() => {
    setOnPrevious(onPrevious);

    return () => setOnPrevious(undefined);
  }, [setOnPrevious, onPrevious]);
}

function OrganizeGallery() {
  const returnToProfile = useCallback(() => {
    // TODO__v1 get username and interpolate here
    navigate('/my-profile');
  }, []);

  useWizardConfig({ onPrevious: returnToProfile });

  const [collections] = useState(mockCollectionsLite(4));

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionDnd collections={collections}></CollectionDnd>
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
