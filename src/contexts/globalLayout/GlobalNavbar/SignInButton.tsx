import useAuthModal from 'hooks/useAuthModal';
import { Paragraph } from 'components/core/Text/Text';
import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';

export function SignInButton() {
  const showAuthModal = useAuthModal();

  return (
    <SignInText role="button" onClick={showAuthModal} color={colors.shadow}>
      Sign in
    </SignInText>
  );
}

const SignInText = styled(Paragraph)`
  font-family: 'ABC Diatype';
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;

  cursor: pointer;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
