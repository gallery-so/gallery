import styled from 'styled-components';
import colors from '../core/colors';
import { HStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import { ButtonPill } from '../Pill';

export default function SearchFilter() {
  return (
    <StyledFilterContainer gap={4}>
      <StyledButtonPill active>
        <TitleDiatypeM>Curators</TitleDiatypeM>
      </StyledButtonPill>
      <StyledButtonPill>
        <TitleDiatypeM>Galleries</TitleDiatypeM>
      </StyledButtonPill>
      <StyledButtonPill>
        <TitleDiatypeM>Communities</TitleDiatypeM>
      </StyledButtonPill>
    </StyledFilterContainer>
  );
}

const StyledFilterContainer = styled(HStack)`
  padding: 8px 0px;
`;

const StyledButtonPill = styled(ButtonPill)<{ active?: boolean }>`
  cursor: pointer;
  ${TitleDiatypeM} {
    color: ${({ active }) => (active ? colors.offBlack : colors.shadow)};
  }

  &:hover {
    ${TitleDiatypeM} {
      color: ${colors.offBlack};
    }
  }
`;
