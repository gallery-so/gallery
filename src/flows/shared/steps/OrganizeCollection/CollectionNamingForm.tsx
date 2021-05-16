import { useState, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import { BodyRegular, BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import { useModal } from 'contexts/modal/ModalContext';
import { Collection } from 'types/Collection';

type Props = {
  onNext: WizardContext['next'];
  collection: Collection;
};

function CollectionNamingForm({ onNext, collection }: Props) {
  const { hideModal } = useModal();

  const [collectionName, setCollectionName] = useState(collection.title || '');
  const [collectionDescription, setCollectionDescription] = useState(
    collection.description || ''
  );

  const handleNameChange = useCallback((event) => {
    setCollectionName(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    setCollectionDescription(event.target.value);
  }, []);

  const hasEnteredValue = useMemo(() => {
    return collectionName.length || collectionDescription.length;
  }, [collectionName, collectionDescription]);

  const buttonText = useMemo(() => {
    return hasEnteredValue ? 'submit' : 'skip';
  }, [hasEnteredValue]);

  const goToNextStep = useCallback(() => {
    onNext();
    hideModal();
  }, [onNext, hideModal]);

  const handleClick = useCallback(() => {
    if (hasEnteredValue) {
      console.log('TODO - making update collection call to database', {
        collectionName,
        collectionDescription,
      });
      goToNextStep();
      return;
    }
    goToNextStep();
  }, [goToNextStep, hasEnteredValue, collectionName, collectionDescription]);

  return (
    <StyledCollectionNamingForm>
      <BodyMedium>Give your collection a name and description</BodyMedium>
      <BodyRegular color={colors.gray50}>
        You can always add a collection name and description later.
      </BodyRegular>
      <Spacer height={20} />
      <BigInput
        onChange={handleNameChange}
        defaultValue={collectionName}
        placeholder="Collection name"
        autoFocus
      />
      <StyledTextArea
        onChange={handleDescriptionChange}
        placeholder="Tell us about your collection..."
      />
      <Spacer height={20} />
      <ButtonContainer>
        <StyledButton text={buttonText} onClick={handleClick} />
      </ButtonContainer>
    </StyledCollectionNamingForm>
  );
}

const StyledCollectionNamingForm = styled.div`
  display: flex;
  flex-direction: column;

  width: 480px;
`;

const StyledTextArea = styled(TextArea)`
  height: 144px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled(Button)`
  width: 90px;
`;

export default CollectionNamingForm;
