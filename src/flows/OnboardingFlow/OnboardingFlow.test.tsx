import { render, screen } from '@testing-library/react';
import OnboardingFlow from './OnboardingFlow';

test.skip('Next button is disabled by default', () => {
  render(<OnboardingFlow />);
  const button = screen.getByTestId('wizard-footer-next-button');

  if (!(button instanceof HTMLButtonElement)) {
    throw Error('Element was not a button');
  }

  expect(button.disabled).toBe(true);
});
