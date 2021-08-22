import { useState, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import BigInput from 'components/core/BigInput/BigInput';
import { BodyRegular, BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import Button from 'components/core/Button/Button';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import ErrorText from 'components/core/Text/ErrorText';
import { useModal } from 'contexts/modal/ModalContext';
import formatError from 'src/errors/formatError';
import useUpdateCollectionInfo from 'hooks/api/collections/useUpdateCollectionInfo';
import { Collection } from 'types/Collection';

type Props = {
  onNext: WizardContext['next'];
  collectionId: Collection['id'];
  collectionTitle?: Collection['name'];
  collectionDescription?: Collection['collectors_note'];
};

export const COLLECTION_DESCRIPTION_MAX_CHAR_COUNT = 300;

function CollectionEditInfoForm({
  onNext,
  collectionId,
  collectionTitle,
  collectionDescription,
}: Props) {
  const { hideModal } = useModal();

  const [title, setTitle] = useState(collectionTitle || '');
  const [description, setDescription] = useState(collectionDescription || '');

  // generic error that doesn't belong to username / bio
  const [generalError, setGeneralError] = useState('');

  const handleNameChange = useCallback((event) => {
    setTitle(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    setDescription(event.target.value);
  }, []);

  const hasEnteredValue = useMemo(() => {
    return title.length || description.length;
  }, [title, description]);

  const buttonText = useMemo(() => {
    return hasEnteredValue ? 'save' : 'skip';
  }, [hasEnteredValue]);

  const goToNextStep = useCallback(() => {
    onNext();
    hideModal();
  }, [onNext, hideModal]);

  const [isLoading, setIsLoading] = useState(false);

  const updateCollection = useUpdateCollectionInfo();

  const handleClick = useCallback(async () => {
    setGeneralError('');

    if (description.length > COLLECTION_DESCRIPTION_MAX_CHAR_COUNT) {
      // no need to handle error here, since the form will mark the text as red
      return;
    }

    setIsLoading(true);
    try {
      await updateCollection(collectionId, title, description);
      goToNextStep();
    } catch (e) {
      setGeneralError(formatError(e));
    }
    setIsLoading(false);
    return;
  }, [description, updateCollection, collectionId, title, goToNextStep]);

  return (
    <StyledCollectionEditInfoForm>
      <BodyMedium>Give your collection a name and description</BodyMedium>
      <Spacer height={4} />
      <BodyRegular color={colors.gray50}>
        You can always add a collection name and description later.
      </BodyRegular>
      <Spacer height={16} />
      <BigInput
        onChange={handleNameChange}
        defaultValue={title}
        placeholder="Collection name"
        autoFocus
      />
      <Spacer height={24} />
      <StyledTextAreaWithCharCount
        onChange={handleDescriptionChange}
        placeholder="Tell us about your collection..."
        defaultValue={description}
        currentCharCount={description.length}
        maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
      />
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={20} />
      <ButtonContainer>
        <StyledButton
          mini
          text={buttonText}
          onClick={handleClick}
          disabled={isLoading}
          loading={isLoading}
        />
      </ButtonContainer>
    </StyledCollectionEditInfoForm>
  );
}

const StyledCollectionEditInfoForm = styled.div`
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

export default CollectionEditInfoForm;
