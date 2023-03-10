import styled from 'styled-components';

import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL, TitleXS } from '../core/Text/Text';

type Props = {
  children: React.ReactNode;
  title: string;
  isShowAll?: boolean;
  onShowAll: () => void;
  hasResult: boolean;
};

export default function SearchSection({
  children,
  title,
  isShowAll = false,
  onShowAll,
  hasResult,
}: Props) {
  if (!isShowAll && !hasResult) return null;

  if (isShowAll && !hasResult)
    return (
      <StyledNoResultContainer align="center" justify="center">
        <TitleDiatypeL>Nothing Found</TitleDiatypeL>
      </StyledNoResultContainer>
    );

  return (
    <VStack gap={10}>
      <StyledResultHeader align="center" justify="space-between">
        <StyledTitle>{title}</StyledTitle>

        {!isShowAll && <StyledInteractiveLink onClick={onShowAll}>Show all</StyledInteractiveLink>}
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
  color: ${colors.offBlack};
`;

const StyledNoResultContainer = styled(VStack)`
  height: 100%;
`;
