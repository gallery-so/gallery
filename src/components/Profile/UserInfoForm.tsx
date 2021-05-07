import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';

import { Text } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';
import { USERNAME_REGEX } from 'utils/regex';

type Props = {
  onSubmit?: (event: FormEvent) => void;
  handleIsValidChange: (isValid: boolean) => void;
  mode?: string;
};

function UserInfoForm({ onSubmit, handleIsValidChange, mode = 'Add' }: Props) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const handleUsernameChange = useCallback(
    (event) => {
      // TODO consider debouncing validation
      setUsername(event.target.value);
      const isValid = USERNAME_REGEX.test(event.target.value);
      handleIsValidChange(isValid);
    },
    [handleIsValidChange]
  );
  const handleBioChange = useCallback((event) => {
    setBio(event.target.value);
  }, []);

  return (
    <StyledForm onSubmit={onSubmit}>
      <StyledText>{`${mode} username and bio`}</StyledText>
      <Spacer height={14} />
      <BigInput onChange={handleUsernameChange} placeholder="Username" />
      <Spacer height={10} />
      <StyledTextArea onChange={handleBioChange} placeholder="Bio (optional)" />
    </StyledForm>
  );
}
export default UserInfoForm;
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledText = styled(Text)`
  font-weight: 500;
  padding-left: 4px;
`;

const StyledTextArea = styled(TextArea)`
  height: 160px;
`;
