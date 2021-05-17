import { useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import CollectionNamingForm from './CollectionNamingForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import CollectionEditorProvider from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';

type ConfigProps = {
  onNext: WizardContext['next'];
};

type Props = {
  step?: any;
};

function useWizardConfig({ onNext }: ConfigProps) {
  const wizardId = useWizardId();
  const { setOnNext } = useWizardCallback();
  const { showModal } = useModal();

  useEffect(() => {
    // if the user is part of the onboarding flow, prompt them
    // to name their collection before moving onto the next step
    if (wizardId === 'onboarding') {
      setOnNext(() =>
        showModal(
          <CollectionNamingForm
            onNext={onNext}
            // TODO: pass in the actual collection being organized
            collection={{ id: '', nfts: [] }}
          />
        )
      );
    }

    return () => setOnNext(undefined);
  }, [setOnNext, showModal, onNext, wizardId]);
}

function OrganizeCollection({ next }: WizardContext & Props) {
  useWizardConfig({ onNext: next });

  return (
    <StyledOrganizeCollection>
      <CollectionEditorProvider>
        <CollectionEditor />
      </CollectionEditorProvider>
    </StyledOrganizeCollection>
  );
}

const StyledOrganizeCollection = styled.div`
  display: flex;
`;

export default OrganizeCollection;
