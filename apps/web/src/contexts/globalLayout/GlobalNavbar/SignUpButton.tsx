import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts, flows } from '~/shared/analytics/constants';

type Props = {
  className?: string;
  size?: 'md' | 'lg';
};

export function SignUpButton({ className, size = 'md' }: Props) {
  const showAuthModal = useAuthModal('sign-up');

  return (
    <StyledButton
      eventElementId="Sign Up Button"
      eventName="Attempt Sign Up"
      eventContext={contexts.Authentication}
      eventFlow={flows['Web Signup Flow']}
      onClick={showAuthModal}
      className={className}
      size={size}
    >
      <StyledButtonText size={size}>Sign up</StyledButtonText>
    </StyledButton>
  );
}

const StyledButton = styled(Button)<{ size: string }>`
  padding: ${({ size }) => (size === 'md' ? '8px 24px' : '12px 40px')};
`;

const StyledButtonText = styled(TitleDiatypeL)<{ size: string }>`
  font-size: ${({ size }) => (size === 'md' ? '12px' : '18px')};
  line-height: ${({ size }) => (size === 'md' ? '16px' : '24px')};
  font-weight: 400;
  color: ${colors.white};
`;
