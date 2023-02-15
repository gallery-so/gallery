import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import colors from '~/components/core/colors';
import transitions from '~/components/core/transitions';
import useAuthModal from '~/hooks/useAuthModal';

export function SignInButton() {
  const showAuthModal = useAuthModal('signIn');

  return <SignInWrapper text="Sign In" onClick={showAuthModal} />;
}

const SignInWrapper = styled(TextButton)`
  @media only screen and ${breakpoints.tablet} {
    padding: 8px 16px;
    transition: background-color ${transitions.cubic};
    &:hover {
      background-color: ${colors.faint};
    }
  }
`;
