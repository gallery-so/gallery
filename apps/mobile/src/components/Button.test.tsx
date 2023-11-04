import { render } from '@testing-library/react-native';
import React from 'react';

import { AppTestContext } from '~/tests/AppTestContext';

import { Button } from './Button';

describe('Button', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <AppTestContext>
        <Button text="yolo" eventElementId={null} eventName={null} />
      </AppTestContext>
    );
    expect(getByText('yolo')).toBeTruthy();
  });
});
