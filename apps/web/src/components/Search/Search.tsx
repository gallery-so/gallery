import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { Suspense, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';

import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { VStack } from '../core/Spacer/Stack';
import { Spinner } from '../core/Spinner/Spinner';
import { useSearchContext } from './SearchContext';
import SearchFilter from './SearchFilter';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import { SearchItemType } from './types';

export type SearchFilterType = 'top' | 'curator' | 'gallery' | 'community' | null;

export default function Search() {
  const [selectedFilter, setSelectedFilter] = useState<SearchFilterType>(null);
  const { keyword } = useSearchContext();
  const { hideDrawer } = useDrawerActions();
  const router = useRouter();
  const track = useTrack();

  const getRoute = useCallback((item: SearchItemType) => {
    if (item.type === 'User') {
      return {
        pathname: '/[username]',
        query: { username: item.label as string },
      } as Route;
    } else if (item.type === 'Community') {
      return item.communityPageUrl;
    } else if (item.type === 'Gallery') {
      const { owner, value } = item;
      return {
        pathname: '/[username]/galleries/[galleryId]',
        query: { username: owner, galleryId: value },
      } as Route;
    }
  }, []);

  const handleSelect = useCallback(
    (item: SearchItemType) => {
      const path = getRoute(item);

      if (!path) {
        return;
      }

      const fullLink = route(path);

      track('Search result click', {
        searchQuery: keyword,
        pathname: fullLink,
        resultType: item.type,
        context: contexts.Search,
      });

      router.push(path);
      hideDrawer();
    },
    [getRoute, hideDrawer, keyword, router, track]
  );

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
              onSelect={handleSelect}
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
