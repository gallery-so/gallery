import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { LISTENING_ONCHAIN, PendingState, PROMPT_SIGNATURE } from 'types/Wallet';
import colors from 'components/core/colors';
import styled, { keyframes } from 'styled-components';

type Props = {
  pendingState: PendingState;
  userFriendlyWalletName: string;
};

function GnosisSafePendingMessage({ pendingState, userFriendlyWalletName }: Props) {
  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>
          Connecting with Gnosis requires an on-chain transaction.
        </BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          Follow the prompts in the Gnosis app to sign the message.
        </BodyRegular>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>Do not close this window.</BodyRegular>
      </div>
    );
  }

  if (pendingState === LISTENING_ONCHAIN) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>
          Connecting with Gnosis requires an on-chain transaction.
        </BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          Transaction submitted. Awaiting confirmation and execution by remaining Gnosis Safe
          owners.
        </BodyRegular>
        <Spacer height={24} />
        <StyledLoaderWrapper>
          <StyledLoader />
        </StyledLoaderWrapper>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>Do not close this window.</BodyRegular>
      </div>
    );
  }

  return (
    <div>
      <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
      <Spacer height={8} />
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </div>
  );
}

const StyledLoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const loading = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledLoader = styled.div`
  border: 1px solid ${colors.gray50};
  border-radius: 50%;
  border-right-color: transparent;
  border-bottom-color: transparent;
  width: 40px;
  height: 40px;
  animation-name: ${loading};
  animation-duration: 1200ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;

export default GnosisSafePendingMessage;
