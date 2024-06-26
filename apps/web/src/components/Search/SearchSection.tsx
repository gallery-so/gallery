import { useMemo } from 'react';
import styled from 'styled-components';

import { contexts } from '~/shared/analytics/constants';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';
import SearchResultsHeader from './SearchResultsHeader';
import { SearchResultVariant } from './types';

type Props = {
  children: React.ReactNode;
  title: string;
  isShowAll?: boolean;
  onShowAll: () => void;
  numResults: number;

  variant: SearchResultVariant;
};

export default function SearchSection({
  children,
  title,
  isShowAll = false,
  onShowAll,
  numResults,
  variant,
}: Props) {
  const showAllButton = useMemo(() => {
    if (variant === 'compact') return false;

    return !isShowAll && numResults > NUM_PREVIEW_SEARCH_RESULTS;
  }, [variant, isShowAll, numResults]);

  if (!isShowAll && numResults === 0) return null;

  if (isShowAll && numResults === 0)
    return (
      <StyledNoResultContainer align="center" justify="center">
        <TitleDiatypeL>No results</TitleDiatypeL>
      </StyledNoResultContainer>
    );

  return (
    <VStack gap={variant === 'compact' ? 0 : 10}>
      <StyledResultHeader align="center" justify="space-between">
        <SearchResultsHeader variant={variant}>{title}</SearchResultsHeader>

        {showAllButton && (
          <StyledGalleryLink
            onClick={onShowAll}
            eventElementId="Search Show All"
            eventName="Search Show All Click"
            eventContext={contexts.Search}
          >
            Show all
          </StyledGalleryLink>
        )}
      </StyledResultHeader>
      <VStack>{children}</VStack>
    </VStack>
  );
}

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledGalleryLink = styled(GalleryLink)`
  font-size: 12px;
  line-height: 16px;
`;

const StyledNoResultContainer = styled(VStack)`
  height: 100%;
`;
