import { Suspense, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';

import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { MentionType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import SearchProvider from '../Search/SearchContext';
import SearchResults from '../Search/SearchResults';
import { SearchItemType } from '../Search/types';
import { MentionResultFallback } from './MentionResultFallback';

type Props = {
  keyword: string;
  onSelectMention: (item: MentionType) => void;
  onEmptyResultsClose?: () => void;
};

export function MentionModal({ keyword, onSelectMention, onEmptyResultsClose = noop }: Props) {
  const track = useTrack();

  useHotkeys(
    ['ArrowUp', 'ArrowDown', 'Enter'],
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
        if (event.key === 'Enter') {
          if (focused instanceof HTMLElement) {
            focused.click();
          }
        } else {
          nextResult.focus();
        }
      }
    },
    { enableOnFormTags: true, preventDefault: true }
  );

  const handleSelectMention = useCallback(
    (item: SearchItemType) => {
      if (item.type === 'Gallery') return;

      const mention: MentionType = {
        type: item.type,
        label: item.label,
        value: item.value,
      };

      track('Search mention result click', {
        searchQuery: keyword,
        resultType: item.type,
        context: contexts.Mention,
      });

      onSelectMention(mention);
    },
    [keyword, onSelectMention, track]
  );

  if (!keyword)
    return (
      <StyledWrapper>
        <MentionResultFallback />
      </StyledWrapper>
    );

  return (
    <StyledWrapper>
      <SearchProvider>
        <Suspense fallback={<MentionResultFallback />}>
          <SearchResults
            activeFilter="top"
            keyword={keyword}
            onChangeFilter={() => {}}
            variant="compact"
            onSelect={handleSelectMention}
            onEmptyResultsClose={onEmptyResultsClose}
          />
        </Suspense>
      </SearchProvider>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 231px;
  background-color: #fff;
  border: 1px solid ${colors.porcelain};
  padding: 4px 0;
`;
