import useAuthModal from 'hooks/useAuthModal';
import { Paragraph } from 'components/core/Text/Text';
import styled from 'styled-components';

export function SignInButton() {
  const showAuthModal = useAuthModal();

  return (
    <SignInText role="button" onClick={showAuthModal}>
      Sign in
    </SignInText>
  );
}

const SignInText = styled(Paragraph)`
  font-family: 'ABC Diatype';
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  letter-spacing: -0.04em;

  cursor: pointer;
`;
