import styled from 'styled-components';
import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import SearchFilter from './SearchFilter';

import SearchInput from './SearchInput';

export default function Search() {
  return (
    <>
      <DrawerHeader>
        <SearchInput />
      </DrawerHeader>
      <StyledSearchContent>
        <SearchFilter />
      </StyledSearchContent>
    </>
  );
}

const StyledSearchContent = styled.div`
  padding: 0 16px;
`;
