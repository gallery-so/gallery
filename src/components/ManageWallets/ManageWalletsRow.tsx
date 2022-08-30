import { BaseM, BODY_MONO_FONT_FAMILY } from 'components/core/Text/Text';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { truncateAddress } from 'utils/wallet';
import { isWeb3Error } from 'types/Error';
import ReactTooltip from 'react-tooltip';
import useRemoveWallet from 'components/WalletSelector/mutations/useRemoveWallet';
import { walletIconMap } from 'components/WalletSelector/multichain/WalletButton';
import Tooltip from 'components/Tooltip/Tooltip';
import { Button } from 'components/core/Button/Button';

type Props = {
  walletId: string;
  address: string;
  chain: string;
  userSigninAddress: string;
  setErrorMessage: (message: string) => void;
  setRemovedAddress: (address: string) => void;
  isOnlyWalletConnected: boolean;
};

function ManageWalletsRow({
  walletId,
  address,
  chain,
  userSigninAddress,
  setErrorMessage,
  setRemovedAddress,
  isOnlyWalletConnected,
}: Props) {
  const removeWallet = useRemoveWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleDisconnectClick = useCallback(async () => {
    ReactTooltip.hide();
    try {
      setErrorMessage('');
      setIsDisconnecting(true);
      await removeWallet(walletId);
      setRemovedAddress(address);
    } catch (error) {
      setIsDisconnecting(false);
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [setErrorMessage, removeWallet, walletId, setRemovedAddress, address]);

  const showDisconnectButton = address !== userSigninAddress && !isOnlyWalletConnected;

  const iconUrl = walletIconMap[chain.toLowerCase() as keyof typeof walletIconMap];

  return (
    <StyledWalletRow>
      <StyledWalletDetails>
        <Icon src={iconUrl} />
        <StyledWalletAddress>{truncateAddress(address)}</StyledWalletAddress>
      </StyledWalletDetails>
      {showDisconnectButton && (
        <>
          <StyledDisconnectButton
            variant="error"
            onClick={handleDisconnectClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseExit}
            data-tip
            data-for="global"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </StyledDisconnectButton>
          <ReactTooltip id="global" place="top" effect="solid" arrowColor="transparent">
            <StyledTooltip
              showTooltip={showTooltip}
              whiteSpace="normal"
              text="Remove all pieces in this wallet from your collections."
            />
          </ReactTooltip>
        </>
      )}
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

const StyledDisconnectButton = styled(Button)`
  padding: 8px 16px;
`;

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  left: -35px;
  width: 180px;
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -24 : -20)}px);
`;
