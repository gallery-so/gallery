import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL, TitleXS } from '../core/Text/Text';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';

type Props = {
  children: React.ReactNode;
  title: string;
  isShowAll?: boolean;
  onShowAll: () => void;
  numResults: number;
};

export default function SearchSection({
  children,
  title,
  isShowAll = false,
  onShowAll,
  numResults,
}: Props) {
  if (!isShowAll && numResults === 0) return null;

  if (isShowAll && numResults === 0)
    return (
      <StyledNoResultContainer align="center" justify="center">
        <TitleDiatypeL>No results</TitleDiatypeL>
      </StyledNoResultContainer>
    );

  return (
    <VStack gap={10}>
      <StyledResultHeader align="center" justify="space-between">
        <StyledTitle>{title}</StyledTitle>

        {!isShowAll && numResults > NUM_PREVIEW_SEARCH_RESULTS && (
          <StyledInteractiveLink onClick={onShowAll}>Show all</StyledInteractiveLink>
        )}
      </StyledResultHeader>
      <VStack>{children}</VStack>
    </VStack>
  );
}

const StyledTitle = styled(TitleXS)`
  text-transform: uppercase;
  color: ${colors.metal};
`;

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
  line-height: 16px;
`;

const StyledNoResultContainer = styled(VStack)`
  height: 100%;
`;
