import { render, screen } from '@testing-library/react';
import CollectionCreationFlow from './CollectionCreationFlow';

test('Next button is disabled by default', () => {
  render(<CollectionCreationFlow></CollectionCreationFlow>);
  const button = screen.getByTestId('wizard-footer-next-button');
  expect(button.disabled).toBe(true);
});
