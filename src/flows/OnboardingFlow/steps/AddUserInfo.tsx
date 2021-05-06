import { useState } from 'react';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import BigInput from 'components/core/BigInput/BigInput';
import TextArea from 'components/core/TextArea/TextArea';
import Spacer from 'components/core/Spacer/Spacer';
import {
  useWizardValidationActions,
  useWizardValidationState,
} from 'contexts/wizard/WizardValidationContext';
import { useCallback } from 'react';
import { USERNAME_REGEX } from 'utils/regex';
import { WizardContext } from 'react-albus';

function AddUserInfo({ next }: WizardContext) {
  const { setNextEnabled } = useWizardValidationActions();
  const { isNextEnabled } = useWizardValidationState();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleUsernameChange = useCallback(
    (event) => {
      // TODO consider debouncing validation
      setUsername(event.target.value);
      const isValid = USERNAME_REGEX.test(event.target.value);
      setNextEnabled(isValid);
    },
    [setNextEnabled]
  );

  const handleBioChange = useCallback((event) => {
    setBio(event.target.value);
  }, []);

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (isNextEnabled) {
        next();
      }
    },
    [isNextEnabled, next]
  );

  return (
    <StyledUserInfo>
      <StyledForm onSubmit={onSubmit}>
        <StyledText>Add username &amp; bio</StyledText>
        <BigInput onChange={handleUsernameChange} placeholder="Username" />
        <Spacer height={20} />
        <StyledTextArea
          onChange={handleBioChange}
          placeholder="Bio (optional)"
        />
      </StyledForm>
    </StyledUserInfo>
  );
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  margin: 25vh auto 0;
`;

const StyledText = styled(Text)`
  font-weight: 500;
  padding-left: 4px;
`;

const StyledTextArea = styled(TextArea)`
  height: 160px;
`;

export default AddUserInfo;
