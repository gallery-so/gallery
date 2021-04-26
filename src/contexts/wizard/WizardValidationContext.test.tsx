import { render } from '@testing-library/react';
import WizardValidationProvider from './WizardValidationContext';

test('WizardValidationContext default values', () => {
  render(
    <WizardValidationProvider>
      <></>
    </WizardValidationProvider>
  );
});
