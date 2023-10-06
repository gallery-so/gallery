import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  heading: string;
  body: string;
  reset: () => void;
};

export const WalletSelectorError = ({ heading, body, reset }: Props) => (
  <EmptyState title={heading} description={body}>
    <StyledButtonContainer>
      <StyledRetryButton
        eventElementId="Try Another Wallet Button"
        eventName="Try Another Wallet"
        eventContext={contexts.Authentication}
        onClick={reset}
      >
        Try Another Wallet
      </StyledRetryButton>
    </StyledButtonContainer>
  </EmptyState>
);

const StyledButtonContainer = styled(VStack)`
  padding-top: 30px;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;
