import { useState, useCallback } from 'react';
import styled from 'styled-components';

import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';

function CollectionNamingForm() {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');

  const handleNameChange = useCallback((event) => {
    // do something
  }, []);

  const handleDescriptionChange = useCallback((event) => {
    // do something
  }, []);

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

export default CollectionNamingForm;
