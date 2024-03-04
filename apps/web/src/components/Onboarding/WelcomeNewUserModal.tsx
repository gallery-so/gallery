import { contexts } from 'shared/analytics/constants';
import styled from 'styled-components';

import { Button } from '../core/Button/Button';
import { VStack } from '../core/Spacer/Stack';
import { BaseM, TitleL } from '../core/Text/Text';

type Props = {
  username: string;
  onContinue: () => void;
};

export function WelcomeNewUserModal({ username, onContinue }: Props) {
  return (
    <StyledWelcomeModal gap={32} align="center">
      <TitleL>
        Welcome to Gallery, <br />
        {username}!
      </TitleL>
      <BaseM>
        This is where you’ll see updates from other Gallery users. Toggle between your personalized
        'For You' feed and the 'Following' feed, showing the latest updates from your connections.
      </BaseM>
      <StyledButton
        onClick={onContinue}
        eventElementId="Welcome New User Modal"
        eventName="Click Welcome New User Modal"
        eventContext={contexts.Onboarding}
      >
        Continue
      </StyledButton>
    </StyledWelcomeModal>
  );
}

const StyledWelcomeModal = styled(VStack)`
  width: 500px;
  padding: 24px 32px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 150px;
`;
