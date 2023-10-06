import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts, flows } from '~/shared/analytics/constants';

export function SignUpButton() {
  const showAuthModal = useAuthModal('sign-up');

  return (
    <StyledButton
      eventElementId="Sign Up Button"
      eventName="Attempt Sign Up"
      eventContext={contexts.Authentication}
      eventFlow={flows['Web Signup Flow']}
      onClick={showAuthModal}
    >
      Sign up
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  padding: 8px 16px;
`;
