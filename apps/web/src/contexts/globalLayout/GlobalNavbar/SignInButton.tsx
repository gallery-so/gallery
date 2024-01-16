import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  buttonLocation: string;
  className?: string;
};

export function SignInButton({ className, buttonLocation }: Props) {
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
    >
      <StyledButtonText>Sign in</StyledButtonText>
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  padding: 8px 24px;
`;

const StyledButtonText = styled(TitleDiatypeL)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
`;
