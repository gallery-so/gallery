import colors from 'components/core/colors';
import TextButton from 'components/core/Button/TextButton';
import { BaseM } from 'components/core/Text/Text';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { truncateAddress } from 'utils/wallet';
import { isWeb3Error } from 'types/Error';
import useRemoveUserAddress from 'hooks/api/users/useRemoveUserAddress';
import ReactTooltip from 'react-tooltip';
import breakpoints from 'components/core/breakpoints';

type Props = {
  address: string;
  userSigninAddress: string;
  setErrorMessage: (message: string) => void;
  setRemovedAddress: (address: string) => void;
};

function ManageWalletsRow({
  address,
  userSigninAddress,
  setErrorMessage,
  setRemovedAddress,
}: Props) {
  const removeUserAddress = useRemoveUserAddress();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectClick = useCallback(async () => {
    ReactTooltip.hide();
    try {
      setErrorMessage('');
      setIsDisconnecting(true);
      await removeUserAddress(address);
      setRemovedAddress(address);
    } catch (error: unknown) {
      setIsDisconnecting(false);
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [setErrorMessage, removeUserAddress, address, setRemovedAddress]);

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
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  margin-bottom: 8px;
  justify-content: space-between;
  flex-direction: column;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
