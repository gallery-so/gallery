import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';

import breakpoints from '../breakpoints';
import { Button } from '../Button/Button';
import { HStack, VStack } from '../Spacer/Stack';
import { BaseM } from '../Text/Text';

type Props = {
  title?: string;
  description: string;
  onClose: () => void;
  onClick: () => void;
  ctaText?: string;
};

export function GlobalBanner({ title, ctaText, description, onClose, onClick }: Props) {
  return (
    <StyledWrapper align="center" justify="space-between">
      <StyledTextWrapper>
        {title && (
          <BaseM>
            <strong>{title}</strong>
          </BaseM>
        )}
        <BaseM>{description}</BaseM>
      </StyledTextWrapper>
      <StyledButtonWrapper>
        <StyledButton onClick={onClick}>{ctaText}</StyledButton>

        <IconContainer variant="blue" size="sm" icon={<StyledCloseIcon />} onClick={onClose} />
      </StyledButtonWrapper>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(HStack)`
  background-color: ${colors.activeBlue};
  padding: 8px 16px;

  ${BaseM} {
    color: ${colors.white};
  }
`;

const StyledTextWrapper = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 8px;
  }
`;

const StyledButtonWrapper = styled(HStack).attrs({
  align: 'center',
})`
  gap: 8px;

  @media only screen and ${breakpoints.tablet} {
    gap: 24px;
  }
`;

const StyledCloseIcon = styled(CloseIcon)`
  color: ${colors.white};
`;

const StyledButton = styled(Button)`
  background-color: ${colors.offWhite};
  color: ${colors.activeBlue};
  font-weight: 500;
`;