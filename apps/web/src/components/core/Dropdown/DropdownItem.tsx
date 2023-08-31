import styled from 'styled-components';

import colors from '~/shared/theme/colors';

export const DropdownItem = styled.div<{ disabled?: boolean }>`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  width: 100%;

  color: ${({ disabled }) => (disabled ? '#c2c2c2' : colors.shadow)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};

  white-space: nowrap;

  &:hover {
    color: ${({ disabled }) => (disabled ? '#c2c2c2' : colors.black['800'])};
    background-color: ${({ disabled }) => (disabled ? colors.faint : colors.faint)};
  }
`;
