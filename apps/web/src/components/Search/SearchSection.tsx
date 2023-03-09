import styled from 'styled-components';

import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack,VStack } from '../core/Spacer/Stack';
import { TitleXS } from '../core/Text/Text';

type Props = {
  children: React.ReactNode;
  title: string;
  isShowAll?: boolean;
  onShowAll: () => void;
};

export default function SearchSection({ children, title, isShowAll = false, onShowAll }: Props) {
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
`;

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.offBlack};
`;
