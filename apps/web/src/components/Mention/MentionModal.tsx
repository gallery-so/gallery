import { Suspense } from 'react';
import styled from 'styled-components';

import { MentionType } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

import SearchProvider from '../Search/SearchContext';
import SearchResults from '../Search/SearchResults';
import { MentionResultFallback } from './MentionResultFallback';

type Props = {
  keyword: string;
  onSelectMention: (item: MentionType) => void;
};

export function MentionModal({ keyword, onSelectMention }: Props) {
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
            onSelect={onSelectMention}
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
