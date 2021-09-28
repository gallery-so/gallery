import colors from 'components/core/colors';
import TextButton from 'components/core/Button/TextButton';
import { BodyRegular } from 'components/core/Text/Text';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { truncateAddress } from 'utils/wallet';
import { isWeb3Error } from 'types/Error';
import useRemoveUserAddress from 'hooks/api/users/useRemoveUserAddress';

type Props = {
  index: number;
  address: string;
  userSigninAddress: string;
  setErrorMessage: (message: string) => void;
};

function ManageWalletsRow({ index, address, userSigninAddress, setErrorMessage }: Props) {
  const removeUserAddress = useRemoveUserAddress();
  const handleDisconnectClick = useCallback(async () => {
    try {
      setErrorMessage('');
      await removeUserAddress(address);
    } catch (error: unknown) {
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [address, setErrorMessage, removeUserAddress]);

  const showDisconnectButton = useMemo(() => address !== userSigninAddress, [address, userSigninAddress]);

  return (
    <StyledWalletRow >
      <BodyRegular>{truncateAddress(address)}</BodyRegular>
      {showDisconnectButton
        && <TextButton
          text="Disconnect"
          onClick={handleDisconnectClick}
          underlineOnHover
        />
      }
    </StyledWalletRow>
  );
}

export default ManageWalletsRow;

const StyledWalletRow = styled.div`
  display: flex;
  border: 1px solid ${colors.black};
  padding: 16px;
  margin-bottom: 8px;
  justify-content: space-between;
`;
