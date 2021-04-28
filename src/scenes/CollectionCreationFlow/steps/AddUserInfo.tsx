import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCallback } from 'react';
import { USERNAME_REGEX } from 'utils/regex';

function AddUserInfo() {
  const { setNextEnabled } = useWizardValidationActions();

  const validateInput = useCallback(
    (inputValue: string, inputType: string) => {
      const isValid = USERNAME_REGEX.test(inputValue);
      setNextEnabled(isValid);
    },
    [setNextEnabled]
  );

  const handleChange = useCallback(
    (event) => {
      const inputValue = event.target.value;
      const inputType = event.target.name;
      // TODO consider debouncing validation
      validateInput(inputValue, inputType);
    },
    [validateInput]
  );

  return (
    <StyledUserInfo>
      <StyledText>Add username &amp; bio</StyledText>
      <StyledBigInput
        placeholder="Username"
        onChange={handleChange}
        name="username"
      ></StyledBigInput>
      <StyledTextArea placeholder="Bio (optional)"></StyledTextArea>
    </StyledUserInfo>
  );
}
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
const StyledBigInput = styled.input`
  padding: 10px 2px;
  margin-top: 20px;
  border: 0;
  font-size: 30px;
  font-family: 'Times New Roman';
  ::placeholder {
    opacity: 0.5;
  }
`;
const StyledTextArea = styled.textarea`
  padding: 14px;
  margin-top: 20px;
  font-family: Helvetica Neue;
  border-color: ${colors.gray50};
  resize: none;
  height: 160px;
`;

export default AddUserInfo;
