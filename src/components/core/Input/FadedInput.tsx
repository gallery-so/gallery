import { ChangeEventHandler, useCallback } from 'react';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';

type FadedInputSize = 'md' | 'lg';

type FadedInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  size: FadedInputSize;
};

export function FadedInput({ value, onChange, placeholder, size }: FadedInputProps) {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <StyledInput size={size} value={value} onChange={handleChange} placeholder={placeholder} />
  );
}

const StyledInput = styled.input<{ size: FadedInputSize }>`
  all: unset;

  width: 100%;
  padding: 6px 12px;

  ${({ size }) => {
    if (size == 'md') {
      return css`
        font-family: ${BODY_FONT_FAMILY};
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
      `;
    } else if (size === 'lg') {
      return css`
        font-family: ${BODY_FONT_FAMILY};
        font-size: 18px;
        line-height: 21px;
        font-weight: 500;
      `;
    }
  }}

  color: ${colors.metal};
  background: transparent;

  :hover,
  :focus {
    background-color: ${colors.offWhite};
  }

  ::placeholder {
    color: ${colors.metal};
  }

  &:focus {
    color: ${colors.offBlack};
  }
`;
