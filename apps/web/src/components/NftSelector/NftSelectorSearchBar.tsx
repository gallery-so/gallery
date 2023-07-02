import styled from 'styled-components';

import SearchIcon from '~/icons/SearchIcon';
import colors from '~/shared/theme/colors';

import { HStack } from '../core/Spacer/Stack';

type Props = {
  keyword: string;
  onChange: (searchQuery: string) => void;
};

export function NftSelectorSearchBar({ keyword, onChange }: Props) {
  return (
    <StyledInputContainer align="center" gap={10}>
      <SearchIcon />
      <StyledInputSearch
        type="text"
        autoComplete="off"
        autoCorrect="off"
        placeholder="Search collection"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
      />
    </StyledInputContainer>
  );
}

const StyledInputContainer = styled(HStack)`
  padding: 4px 8px;
  background-color: ${colors.offWhite};
  flex: 1;
`;

const StyledInputSearch = styled.input`
  width: 100%;

  border: none;
  padding: 0;

  background-color: transparent;

  color: ${colors.metal};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
