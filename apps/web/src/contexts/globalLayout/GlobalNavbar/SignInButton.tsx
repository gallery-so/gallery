import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import TextButton from '~/components/core/Button/TextButton';
import transitions from '~/components/core/transitions';
import useAuthModal from '~/hooks/useAuthModal';
import colors from '~/shared/theme/colors';

export function SignInButton() {
  const showAuthModal = useAuthModal('sign-in');

  return (
    <SignInWrapper
      eventElementId="Sign In Button"
      eventName="Attempt Sign In"
      eventContext="Authentication"
      text="Sign In"
      onClick={showAuthModal}
    />
  );
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
