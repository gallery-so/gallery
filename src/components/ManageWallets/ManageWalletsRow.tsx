import { useCallback, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM, BODY_MONO_FONT_FAMILY } from '~/components/core/Text/Text';
import { walletIconMap } from '~/components/WalletSelector/multichain/WalletButton';
import useRemoveWallet from '~/components/WalletSelector/mutations/useRemoveWallet';
import { isWeb3Error } from '~/types/Error';
import { truncateAddress } from '~/utils/wallet';

import breakpoints from '../core/breakpoints';
import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';
import useUpdatePrimaryWallet from '../WalletSelector/mutations/useUpdatePrimaryWallet';

type Props = {
  walletId: string;
  address: string;
  chain: string;
  userSigninAddress: string;
  setErrorMessage: (message: string) => void;
  setRemovedAddress: (address: string) => void;
  isOnlyWalletConnected: boolean;
};

function ManageWalletsRow({ walletId, address, chain, setErrorMessage, setRemovedAddress }: Props) {
  const removeWallet = useRemoveWallet();
  const updatePrimaryWallet = useUpdatePrimaryWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDisconnectClick = useCallback(async () => {
    ReactTooltip.hide();
    try {
      setErrorMessage('');
      setIsDisconnecting(true);
      setIsPending(true);
      await removeWallet(walletId);
      setRemovedAddress(address);
    } catch (error) {
      setIsDisconnecting(false);
      setIsPending(false);
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [setErrorMessage, removeWallet, walletId, setRemovedAddress, address]);

  const handleSetPrimaryClick = useCallback(async () => {
    setIsPending(true);
    setErrorMessage('');
    try {
      await updatePrimaryWallet(walletId);
      setIsPending(false);
    } catch {
      setErrorMessage(`There was an error while updating the primary wallet.`);
      setIsPending(false);
    }
  }, [updatePrimaryWallet, walletId, setErrorMessage]);

  const iconUrl = walletIconMap[chain.toLowerCase() as keyof typeof walletIconMap];
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  return (
    <StyledWalletRow>
      <StyledWalletDetails>
        <Icon src={iconUrl} />
        <StyledWalletAddress>{truncateAddress(address)}</StyledWalletAddress>
      </StyledWalletDetails>
      <StyledButtonContainer>
        <StyledButton variant="secondary" onClick={handleSetPrimaryClick} disabled={isPending}>
          Set Primary
        </StyledButton>

        <div {...getReferenceProps()} ref={reference}>
          <StyledButton
            variant="warning"
            onClick={handleDisconnectClick}
            data-tip
            data-for="global"
            disabled={isPending}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </StyledButton>
        </div>
        <NewTooltip
          {...getFloatingProps()}
          style={floatingStyle}
          ref={floating}
          text="Remove all pieces in this wallet from your collections."
        />
      </StyledButtonContainer>
    </StyledWalletRow>
  );
}

export default ManageWalletsRow;

const StyledWalletRow = styled.div`
  display: flex;
  padding: 8px 0px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const StyledWalletDetails = styled.div`
  display: flex;
  gap: 12px;
`;

const StyledWalletAddress = styled(BaseM)`
  font-family: ${BODY_MONO_FONT_FAMILY};
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
