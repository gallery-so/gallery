import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { Paragraph } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';

export function SignUpButton() {
  const showAuthModal = useAuthModal();

  return (
    <StyledButton onClick={showAuthModal}>
      <SignUpText color={colors.offWhite}>Sign up</SignUpText>
    </StyledButton>
    // <SignUpText role="button" onClick={showAuthModal} color={colors.offBlack}>
    //   Sign up
    // </SignUpText>
  );
}

const StyledButton = styled(Button)`
  padding: 8px 16px;
  text-transform: initial;
`;

const SignUpText = styled(Paragraph)`
  font-family: 'ABC Diatype';
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;

  cursor: pointer;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 16px;
  }
`;
