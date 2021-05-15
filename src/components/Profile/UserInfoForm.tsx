import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';
import { USERNAME_REGEX } from 'utils/regex';

type Props = {
  className?: string;
  onSubmit?: (event: FormEvent) => void;
  handleIsValidChange: (isValid: boolean) => void;
  mode?: string;
};

function UserInfoForm({
  className,
  onSubmit,
  handleIsValidChange,
  mode = 'Add',
}: Props) {
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
    <StyledForm className={className} onSubmit={onSubmit}>
      <StyledBodyMedium>{`${mode} username and bio`}</StyledBodyMedium>
      <Spacer height={14} />
      <BigInput onChange={handleUsernameChange} placeholder="Username" />
      <Spacer height={10} />
      <StyledTextArea
        onChange={handleBioChange}
        placeholder="Tell us about yourself..."
      />
    </StyledForm>
  );
}
export default UserInfoForm;
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledBodyMedium = styled(BodyMedium)`
  padding-left: 4px;
`;

const StyledTextArea = styled(TextArea)`
  height: 160px;
`;
