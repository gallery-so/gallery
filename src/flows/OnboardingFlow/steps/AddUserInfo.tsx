import { useCallback } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import {
  useWizardValidationActions,
  useWizardValidationState,
} from 'contexts/wizard/WizardValidationContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';

function AddUserInfo({ next }: WizardContext) {
  const { setNextEnabled } = useWizardValidationActions();
  const { isNextEnabled } = useWizardValidationState();

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (isNextEnabled) {
        //   TODO__v1 call backend and save changes
        next();
      }
    },
    [isNextEnabled, next]
  );

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={onSubmit}
        handleIsValidChange={setNextEnabled}
      />
    </FullPageCenteredStep>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

export default AddUserInfo;
