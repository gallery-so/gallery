import TextButton from 'components/core/Button/TextButton';
import { BaseM } from 'components/core/Text/Text';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { truncateAddress } from 'utils/wallet';
import { isWeb3Error } from 'types/Error';
import ReactTooltip from 'react-tooltip';
import useRemoveWallet from 'components/WalletSelector/mutations/useRemoveWallet';

type Props = {
  walletId: string;
  address: string;
  userSigninAddress: string;
  setErrorMessage: (message: string) => void;
  setRemovedAddress: (address: string) => void;
};

function ManageWalletsRow({
  walletId,
  address,
  userSigninAddress,
  setErrorMessage,
  setRemovedAddress,
}: Props) {
  const removeWallet = useRemoveWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectClick = useCallback(async () => {
    ReactTooltip.hide();
    try {
      setErrorMessage('');
      setIsDisconnecting(true);
      await removeWallet(walletId);
      setRemovedAddress(address);
    } catch (error: unknown) {
      setIsDisconnecting(false);
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [setErrorMessage, removeWallet, walletId, setRemovedAddress, address]);

  const showDisconnectButton = useMemo(
    () => address !== userSigninAddress,
    [address, userSigninAddress]
  );

  return (
    <StyledWalletRow>
      <BaseM>{truncateAddress(address)}</BaseM>
      {showDisconnectButton && (
        <>
          <div
            data-tip="Disconnecting a wallet will remove its NFTs from your collections."
            data-class="tooltip"
          >
            <TextButton
              text={isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              onClick={handleDisconnectClick}
            />
          </div>
          <ReactTooltip place="left" effect="solid" />
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
`;
