import { fireEvent, render, screen } from '@testing-library/react';
import AddUserInfo from './AddUserInfo';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from '../WizardFooter';
import { WizardProps } from 'flows/shared/types';

const VALID_USERNAME = 'validUsername';
const INVALID_USERNAME = 'invalid username 1';

beforeEach(() => {
  render(
    <GalleryWizardProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <Steps>
                <Step id="addUserInfo" render={AddUserInfo} />
              </Steps>
              <WizardFooter {...(wizardProps as WizardProps)} />
            </>
          );
        }}
      />
    </GalleryWizardProvider>
  );
});

test('Validates username input and enables Next button accordingly', () => {
  const wizardFooterNextButton = screen.getByTestId(
    'wizard-footer-next-button'
  );
  const input = screen.getByPlaceholderText('Username') as HTMLInputElement;

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
