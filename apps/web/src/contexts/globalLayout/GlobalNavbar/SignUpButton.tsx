import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import useAuthModal from '~/hooks/useAuthModal';

export function SignUpButton() {
  const showAuthModal = useAuthModal('sign-up');

  return <StyledButton onClick={showAuthModal}>Sign up</StyledButton>;
}

const StyledButton = styled(Button)`
  padding: 8px 16px;
`;
