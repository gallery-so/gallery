import { useState, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import BigInput from 'components/core/BigInput/BigInput';
import { BodyRegular, BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import { useModal } from 'contexts/modal/ModalContext';
import { Collection } from 'types/Collection';
import { pause } from 'utils/time';

type Props = {
  onNext: WizardContext['next'];
  collection: Collection;
};

export const COLLECTION_DESCRIPTION_MAX_CHAR_COUNT = 300;

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
    return hasEnteredValue ? 'save' : 'skip';
  }, [hasEnteredValue]);

  const goToNextStep = useCallback(() => {
    onNext();
    hideModal();
  }, [onNext, hideModal]);

  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => {
    // TODO__v1: are there banned chars for collection name?
    const collectionNameIsValid = true;
    const collectionDescriptionIsValid =
      collectionDescription.length <= COLLECTION_DESCRIPTION_MAX_CHAR_COUNT;
    return collectionNameIsValid && collectionDescriptionIsValid;
  }, [collectionDescription]);

  const handleClick = useCallback(async () => {
    // TODO__v1: client-side validation of collection name, description

    if (isValid) {
      setIsLoading(true);

      try {
        // TODO__v1: send request to server to UPDATE user's collection name, description
        await pause(1000);
        hideModal();
        goToNextStep();
      } catch (e) {
        // TODO__v1: depending on type of server error, set error for collection name,
        // collection description, or general modal
      }

      setIsLoading(false);
      return;
    }
    goToNextStep();
  }, [isValid, goToNextStep, hideModal]);

  return (
    <StyledCollectionNamingForm>
      <BodyMedium>Give your collection a name and description</BodyMedium>
      <Spacer height={4} />
      <BodyRegular color={colors.gray50}>
        You can always add a collection name and description later.
      </BodyRegular>
      <Spacer height={16} />
      <BigInput
        onChange={handleNameChange}
        defaultValue={collectionName}
        placeholder="Collection name"
        autoFocus
      />
      <Spacer height={24} />
      <StyledTextAreaWithCharCount
        onChange={handleDescriptionChange}
        placeholder="Tell us about your collection..."
        defaultValue={collectionDescription}
        currentCharCount={collectionDescription.length}
        maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
      />
      <Spacer height={20} />
      <ButtonContainer>
        <StyledButton
          mini
          text={buttonText}
          onClick={handleClick}
          disabled={!isValid || isLoading}
          loading={isLoading}
        />
      </ButtonContainer>
    </StyledCollectionNamingForm>
  );
}

const StyledCollectionNamingForm = styled.div`
  display: flex;
  flex-direction: column;

  width: 480px;
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
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
