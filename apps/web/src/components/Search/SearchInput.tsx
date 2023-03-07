import styled from 'styled-components';

import colors from '../core/colors';

export default function SearchInput() {
  return <StyledInput type="text" placeholder="Search for anything..." />;
}

const StyledInput = styled.input`
  width: 100%;

  border: none;
  padding: 0;

  font-size: 24px;
  background-color: transparent;
  color: ${colors.offBlack};
  caret-color: ${colors.offBlack};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
