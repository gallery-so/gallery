import { Suspense, useCallback, useState } from 'react';
import styled from 'styled-components';

import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import useDebounce from '~/hooks/useDebounce';

import { VStack } from '../core/Spacer/Stack';
import { Spinner } from '../core/Spinner/Spinner';
import SearchFilter from './SearchFilter';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

export type SearchFilterType = 'curator' | 'gallery' | 'community' | null;

export default function Search() {
  const [keyword, setKeyword] = useState<string>('');
  const debouncedKeyword = useDebounce(keyword, 200);

  const [selectedFilter, setSelectedFilter] = useState<SearchFilterType>(null);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  return (
    <>
      <DrawerHeader>
        <SearchInput onChange={handleSearch} />
      </DrawerHeader>

      <SearchFilter activeFilter={selectedFilter} onChangeFilter={setSelectedFilter} />

      <StyledSearchContent gap={8}>
        <Suspense
          fallback={
            <StyledSpinnerContainer align="center" justify="center">
              <Spinner />
            </StyledSpinnerContainer>
          }
        >
          <SearchResults
            activeFilter={selectedFilter}
            keyword={debouncedKeyword}
            onChangeFilter={setSelectedFilter}
          />
        </Suspense>
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

const StyledSpinnerContainer = styled(VStack)`
  height: 100%;
`;
