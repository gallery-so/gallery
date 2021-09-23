import colors from 'components/core/colors';
import TextButton from 'components/core/Button/TextButton';
import { BodyRegular } from 'components/core/Text/Text';
import { removeUserAddress } from 'components/WalletSelector/authRequestUtils';
import { FetcherType } from 'contexts/swr/useFetcher';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { truncateAddress } from 'utils/address';
import { isWeb3Error } from 'types/Error';

type Props = {
  index: number;
  address: string;
  fetcher: FetcherType;
  onDisconnect: (index: number) => void;
  setErrorMessage: (message: string) => void;
};

function ManageWalletsRow({ index, address, fetcher, onDisconnect, setErrorMessage }: Props) {
  const handleDisconnectClick = useCallback(async () => {
    try {
      setErrorMessage('');
      await removeUserAddress({ addresses: [address] }, fetcher).then(() => {
        onDisconnect(index);
      });
    } catch (error: unknown) {
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [address, fetcher, index, onDisconnect, setErrorMessage]);

  //   TODO once the front end can determine which wallet is signed in, dont show disconnect for that wallet
  const showDisconnectButton = useMemo(() => index > 0, [index]);

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
