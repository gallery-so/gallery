import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import TextButton from '~/components/core/Button/TextButton';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

type Props = {
  className?: string;
  size?: 'md' | 'lg';
};

export function SignInButton({ className, size = 'md' }: Props) {
  const showAuthModal = useAuthModal('sign-in');

  return (
    <StyledButton
      eventElementId="Sign In Button"
      eventName="Attempt Sign In"
      eventContext={contexts.Authentication}
      onClick={showAuthModal}
      className={className}
      variant="secondary"
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
