import { useCallback } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import {
  useWizardValidationActions,
  useWizardValidationState,
} from 'contexts/wizard/WizardValidationContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import { FOOTER_HEIGHT } from '../WizardFooter';

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
      <StyledUserInfoForm
        onSubmit={onSubmit}
        handleIsValidChange={setNextEnabled}
      />
    </StyledUserInfo>
  );
}

const StyledUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

export default AddUserInfo;
