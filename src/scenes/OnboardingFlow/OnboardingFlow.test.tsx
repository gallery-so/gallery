import { render, screen } from '@testing-library/react';
import OnboardingFlow from './OnboardingFlow';

test('Next button is disabled by default', () => {
  render(<OnboardingFlow></OnboardingFlow>);
  const button = screen.getByTestId('wizard-footer-next-button');
  expect(button.disabled).toBe(true);
});
