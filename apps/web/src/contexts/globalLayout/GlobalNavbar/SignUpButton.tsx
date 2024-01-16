import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts, flows } from '~/shared/analytics/constants';

type Props = {
  buttonLocation: string;
  className?: string;
};

export function SignUpButton({ className, buttonLocation }: Props) {
  const showAuthModal = useAuthModal('sign-up');

  return (
    <StyledButton
      eventElementId="Sign Up Button"
      eventName="Attempt Sign Up"
      eventContext={contexts.Onboarding}
      eventFlow={flows['Web Signup Flow']}
      properties={{ buttonLocation }}
      onClick={showAuthModal}
      className={className}
    >
      <StyledButtonText>Sign up</StyledButtonText>
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
  color: ${colors.white};
`;
