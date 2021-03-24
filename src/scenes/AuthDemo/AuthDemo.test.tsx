import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthDemo from './AuthDemo';

test('renders Auth Demo', () => {
  render(<AuthDemo />);
  const linkElement = screen.getByText(/AuthDemo/i);
  expect(linkElement).toBeInTheDocument();
});
