import styled from 'styled-components';

import colors from '~/shared/theme/colors';

export const DropdownItem = styled.div`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #808080;
  cursor: pointer;

  white-space: nowrap;

  :hover {
    color: ${colors.offBlack};
    background-color: ${colors.faint};
  }
`;
