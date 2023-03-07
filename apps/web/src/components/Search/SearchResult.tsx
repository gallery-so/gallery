import styled from 'styled-components';

import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleXS } from '../core/Text/Text';

type Props = {
  title: string;
  isShowAll?: boolean;
};

export default function SearchResult({ isShowAll = false, title }: Props) {
  return (
    <VStack gap={10}>
      <StyledResultHeader align="center" justify="space-between">
        <StyledTitle>{title}</StyledTitle>

        {!isShowAll && (
          <StyledInteractiveLink
            to={{
              pathname: '/trending',
            }}
          >
            Show all
          </StyledInteractiveLink>
        )}
      </StyledResultHeader>

      <VStack>
        <StyledResult>
          <StyledResultTitle>alethia</StyledResultTitle>
          <BaseM>witch of wisdom crypto coven</BaseM>
        </StyledResult>

        <StyledResult>
          <StyledResultTitle>alethia</StyledResultTitle>
          <BaseM>witch of wisdom crypto coven</BaseM>
        </StyledResult>

        <StyledResult>
          <StyledResultTitle>alethia</StyledResultTitle>
          <BaseM>witch of wisdom crypto coven</BaseM>
        </StyledResult>
      </VStack>
    </VStack>
  );
}

const StyledTitle = styled(TitleXS)`
  text-transform: uppercase;
`;

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.offBlack};
`;

const StyledResult = styled(VStack)`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;
const StyledResultTitle = styled(BaseM)`
  font-weight: 700;
`;
