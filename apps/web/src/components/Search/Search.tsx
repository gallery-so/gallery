import { Suspense, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';

import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';

import { VStack } from '../core/Spacer/Stack';
import { Spinner } from '../core/Spinner/Spinner';
import { useSearchContext } from './SearchContext';
import SearchFilter from './SearchFilter';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

export type SearchFilterType = 'top' | 'curator' | 'gallery' | 'community' | null;

export default function Search() {
  const [selectedFilter, setSelectedFilter] = useState<SearchFilterType>(null);
  const { keyword } = useSearchContext();
  const { hideDrawer } = useDrawerActions();

  useHotkeys(
    ['ArrowUp', 'ArrowDown'],
    (event) => {
      const allResults = Array.from(document.querySelectorAll('.SearchResult'));
      const focused = document.querySelector('.SearchResult:focus');

      let nextIndex = 0;
      if (focused) {
        const focusedIndex = allResults.indexOf(focused);
        nextIndex = event.key === 'ArrowDown' ? focusedIndex + 1 : focusedIndex - 1;

        // Loop around after reaching end / start
        if (nextIndex >= allResults.length) {
          nextIndex = 0;
        } else if (nextIndex < 0) {
          nextIndex = allResults.length - 1;
        }
      }

      const nextResult = allResults[nextIndex];
      if (nextResult instanceof HTMLElement) {
        nextResult.focus();
      }
    },
    { enableOnFormTags: true, preventDefault: true }
  );

  return (
    <>
      <DrawerHeader>
        <SearchInput />
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
          {keyword && (
            <SearchResults
              activeFilter={selectedFilter}
              keyword={keyword}
              onChangeFilter={setSelectedFilter}
              onClose={hideDrawer}
            />
          )}
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
