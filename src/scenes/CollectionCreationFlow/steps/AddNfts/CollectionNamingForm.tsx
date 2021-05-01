import { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import PrimaryButton from 'components/core/Button/PrimaryButton';

function CollectionNamingForm() {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  const handleNameChange = useCallback((event) => {
    setCollectionName(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    setCollectionDescription(event.target.value);
  }, []);

  const buttonText = useMemo(() => {
    const hasEnteredValue =
      collectionName.length || collectionDescription.length;
    return hasEnteredValue ? 'submit' : 'skip';
  }, [collectionName, collectionDescription]);

  const handleClick = useCallback(() => {}, []);

  return (
    <StyledCollectionNamingForm>
      <Text weight="bold">Optional collection name & description</Text>
      <Text color={colors.gray50}>
        You can always add a collection name and description later.
      </Text>
      <Spacer height={20} />
      <BigInput onChange={handleNameChange} placeholder="Collection name" />
      <StyledTextArea
        onChange={handleDescriptionChange}
        placeholder="Collection description (optional)"
      />
      <Spacer height={20} />
      <ButtonContainer>
        <StyledPrimaryButton text={buttonText} onClick={handleClick} />
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

const StyledPrimaryButton = styled(PrimaryButton)`
  width: 90px;
`;

export default CollectionNamingForm;
