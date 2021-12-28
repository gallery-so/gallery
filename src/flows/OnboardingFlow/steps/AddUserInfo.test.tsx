import { fireEvent, render, screen } from '@testing-library/react';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import { Wizard, Steps, Step } from 'react-albus';
import { WizardProps } from 'flows/shared/types';
import WizardFooter from 'flows/shared/components/WizardFooter/WizardFooter';
import AddUserInfo from './AddUserInfo';

const VALID_USERNAME = 'validUsername';
const INVALID_USERNAME = 'invalid username 1';

beforeEach(() => {
  render(
    <GalleryWizardProvider id="add-user-info">
      <Wizard
        render={(wizardProps) => (
          <>
            <Steps>
              <Step id="addUserInfo" render={AddUserInfo} />
            </Steps>
            <WizardFooter {...(wizardProps as WizardProps)} />
          </>
        )}
      />
    </GalleryWizardProvider>
  );
});

test.skip('Validates username input and enables Next button accordingly', () => {
  const wizardFooterNextButton = screen.getByTestId('wizard-footer-next-button');
  const input = screen.getByPlaceholderText('Username');

  if (!(input instanceof HTMLInputElement)) {
    throw Error('Element was not an input');
  }

  //   Initial state
  expect(wizardFooterNextButton).toBeDisabled();

  //   Enter valid username
  fireEvent.change(input, { target: { value: VALID_USERNAME } });
  expect(input.value).toBe(VALID_USERNAME);
  expect(wizardFooterNextButton).toBeEnabled();

  //   Enter invalid username
  fireEvent.change(input, { target: { value: INVALID_USERNAME } });
  expect(input.value).toBe(INVALID_USERNAME);
  expect(wizardFooterNextButton).toBeDisabled();
});
