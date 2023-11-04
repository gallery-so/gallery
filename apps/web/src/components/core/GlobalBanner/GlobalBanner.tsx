import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { UserExperienceType } from '~/generated/enums';
import CloseIcon from '~/icons/CloseIcon';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import breakpoints from '../breakpoints';
import { Button } from '../Button/Button';
import { HStack, VStack } from '../Spacer/Stack';
import { BaseM } from '../Text/Text';

type StyleProps = {
  bannerVariant: 'default' | 'blue';
};

type Props = {
  title?: string;
  description: string;
  onClose: () => void;
  onClick: () => void;
  ctaText?: string;
  experienceFlag: UserExperienceType;
} & StyleProps;

export function GlobalBanner({
  title,
  ctaText,
  description,
  onClose,
  onClick,
  experienceFlag,
  bannerVariant = 'default',
}: Props) {
  return (
    <StyledWrapper align="center" justify="space-between" bannerVariant={bannerVariant}>
      <StyledTextWrapper>
        {title && (
          <BaseM>
            <strong>{title}</strong>
          </BaseM>
        )}
        <BaseM>{description}</BaseM>
      </StyledTextWrapper>
      <StyledButtonWrapper>
        {ctaText && (
          <StyledButton
            eventElementId="Global Banner CTA Button"
            eventName="Global Banner CTA Button Clicked"
            eventContext={contexts['Global Banner']}
            properties={{ variant: 'default', experienceFlag }}
            onClick={onClick}
            bannerVariant={bannerVariant}
          >
            {ctaText}
          </StyledButton>
        )}

        <IconContainer
          variant={bannerVariant === 'blue' ? 'blue' : 'default'}
          size="sm"
          icon={<CloseIcon />}
          onClick={onClose}
        />
      </StyledButtonWrapper>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(HStack)<StyleProps>`
  background-color: ${({ bannerVariant }) =>
    bannerVariant === 'blue' ? colors.activeBlue : colors.white};
  padding: 8px 16px;
  border-bottom: 1px solid
    ${({ bannerVariant }) => (bannerVariant === 'blue' ? 'transparent' : colors.black[800])};

  ${BaseM} {
    color: ${({ bannerVariant }) => (bannerVariant === 'blue' ? colors.white : colors.black[800])};
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

const StyledButton = styled(Button)<StyleProps>`
  background-color: ${({ bannerVariant }) =>
    bannerVariant === 'blue' ? colors.offWhite : colors.black[800]};
  color: ${({ bannerVariant }) => (bannerVariant === 'blue' ? colors.activeBlue : colors.white)};
  font-weight: 500;
`;
