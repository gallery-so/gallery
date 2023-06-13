import styled, { css } from 'styled-components';

import { TitleXSBold } from '../Text/Text';

export const Chip = styled(TitleXSBold).attrs({ role: 'button' })<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 2px 4px;
  cursor: pointer;

  height: 20px;
  line-height: 1;

  border-radius: 2px;

  white-space: nowrap;

  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          cursor: default;
        `
      : null};
`;
