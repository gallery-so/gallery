import { Suspense, useCallback } from 'react';
import styled from 'styled-components';

import { MentionType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import SearchProvider from '../Search/SearchContext';
import SearchResults from '../Search/SearchResults';
import { SearchItemType } from '../Search/types';
import { MentionResultFallback } from './MentionResultFallback';

type Props = {
  keyword: string;
  onSelectMention: (item: MentionType) => void;
};

export function MentionModal({ keyword, onSelectMention }: Props) {
  const handleSelectMention = useCallback(
    (item: SearchItemType) => {
      if (item.type === 'Gallery') return;

      const mention: MentionType = {
        type: item.type,
        label: item.label,
        value: item.value,
      };

      onSelectMention(mention);
    },
    [onSelectMention]
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
