import { useCallback } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import {
  useWizardValidationActions,
  useWizardValidationState,
} from 'contexts/wizard/WizardValidationContext';
import UserInfoForm from 'components/Profile/UserInfoForm';

function AddUserInfo({ next }: WizardContext) {
  const { setNextEnabled } = useWizardValidationActions();
  const { isNextEnabled } = useWizardValidationState();

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (isNextEnabled) {
        //   TODO call backend and save changes
        next();
      }
    },
    [isNextEnabled, next]
  );

  return (
    <StyledUserInfo>
      <UserInfoForm
        onSubmit={onSubmit}
        handleIsValidChange={setNextEnabled}
      ></UserInfoForm>
    </StyledUserInfo>
  );
}

const StyledUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  margin: 25vh auto 0;
`;

export default AddUserInfo;
