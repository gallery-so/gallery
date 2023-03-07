import { useCallback, useState } from 'react';
import styled from 'styled-components';

import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';

import { VStack } from '../core/Spacer/Stack';
import SearchFilter from './SearchFilter';
import SearchInput from './SearchInput';
import SearchResult from './SearchResult';

export default function Search() {
  const [keyword, setKeyword] = useState('');

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  return (
    <>
      <DrawerHeader>
        <SearchInput onChange={handleSearch} />
      </DrawerHeader>
      <SearchFilter />

      <StyledSearchContent gap={8}>
        <StyledSearchResultContainer>
          {keyword ? (
            <>
              <SearchResult title="New curator" />
              <SearchResult title="New galleries" />
              <SearchResult title="New galleries" />
              <SearchResult title="New galleries" />
              <SearchResult title="New galleries" />
            </>
          ) : (
            <>
              <SearchResult title="curators" />
              <SearchResult title="galleries" />
              <SearchResult title="communities" />
              <SearchResult title="communities" />
              <SearchResult title="communities" />
              <SearchResult title="communities" />
            </>
          )}
        </StyledSearchResultContainer>
      </StyledSearchContent>
    </>
  );
}

const StyledSearchContent = styled(VStack)`
  padding: 0 16px;

  height: 100%;
  width: 100%;
  padding: 4px;
  position: relative;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: contain;
`;

const StyledSearchResultContainer = styled(VStack)``;
