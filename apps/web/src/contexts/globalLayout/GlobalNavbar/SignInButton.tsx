import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  buttonLocation: string;
  className?: string;
  size?: 'md' | 'lg';
};

export function SignInButton({ className, buttonLocation, size = 'md' }: Props) {
  const showAuthModal = useAuthModal('sign-in');

  return (
    <StyledButton
      eventElementId="Sign In Button"
      eventName="Attempt Sign In"
      eventContext={contexts.Authentication}
      properties={{ buttonLocation }}
      onClick={showAuthModal}
      className={className}
      variant="secondary"
      size={size}
    >
      <StyledButtonText size={size}>Sign in</StyledButtonText>
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
`;
