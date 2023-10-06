import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM, BODY_MONO_FONT_FAMILY } from '~/components/core/Text/Text';
import { walletIconMap } from '~/components/WalletSelector/multichain/WalletButton';
import useRemoveWallet from '~/components/WalletSelector/mutations/useRemoveWallet';
import { ManageWalletsRow$key } from '~/generated/ManageWalletsRow.graphql';
import { graphqlTruncateAddress } from '~/shared/utils/wallet';
import { isWeb3Error } from '~/types/Error';

import breakpoints from '../core/breakpoints';
import { HStack } from '../core/Spacer/Stack';
import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';
import useUpdatePrimaryWallet from '../WalletSelector/mutations/useUpdatePrimaryWallet';

type Props = {
  walletId: string;
  address: string;
  chain: string;
  setErrorMessage: (message: string) => void;
  setRemovedAddress: (address: string) => void;
  isOnlyWalletConnected: boolean;
  chainAddressRef: ManageWalletsRow$key;
};

function ManageWalletsRow({
  walletId,
  address,
  chain,
  setErrorMessage,
  setRemovedAddress,
  chainAddressRef,
}: Props) {
  const chainAddress = useFragment(
    graphql`
      fragment ManageWalletsRow on ChainAddress {
        ...walletTruncateAddressFragment
      }
    `,
    chainAddressRef
  );

  const [removeWallet, isRemovingWallet] = useRemoveWallet();
  const [updatePrimaryWallet, isUpdatingPrimaryWallet] = useUpdatePrimaryWallet();

  const handleDisconnectClick = useCallback(async () => {
    try {
      setErrorMessage('');
      await removeWallet(walletId);
      setRemovedAddress(address);
    } catch (error) {
      if (isWeb3Error(error)) {
        setErrorMessage('Error disconnecting wallet');
      }

      throw error;
    }
  }, [setErrorMessage, removeWallet, walletId, setRemovedAddress, address]);

  const handleSetPrimaryClick = useCallback(async () => {
    setErrorMessage('');
    try {
      await updatePrimaryWallet(walletId);
    } catch {
      setErrorMessage(`There was an error while updating the primary wallet.`);
    }
  }, [updatePrimaryWallet, walletId, setErrorMessage]);

  const iconUrl = walletIconMap[chain.toLowerCase() as keyof typeof walletIconMap];
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  return (
    <StyledWalletRow>
      <HStack gap={4} align="center">
        <Icon src={iconUrl} />
        <StyledWalletAddress>{graphqlTruncateAddress(chainAddress)}</StyledWalletAddress>
      </HStack>
      <StyledButtonContainer>
        <StyledButton
          eventElementId="Set Primary Wallet Button"
          eventName="Set Primary Wallet"
          variant="secondary"
          onClick={handleSetPrimaryClick}
          disabled={isUpdatingPrimaryWallet || isRemovingWallet}
        >
          Set Primary
        </StyledButton>

        <div {...getReferenceProps()} ref={reference}>
          <StyledButton
            eventElementId="Remove Wallet Button"
            eventName="Remove Wallet"
            variant="warning"
            onClick={handleDisconnectClick}
            data-tip
            data-for="global"
            disabled={isUpdatingPrimaryWallet || isRemovingWallet}
          >
            {isRemovingWallet ? 'Disconnecting...' : 'Disconnect'}
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
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const StyledWalletAddress = styled(BaseM)`
  font-family: ${BODY_MONO_FONT_FAMILY};
  font-size: 12px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 14px;
  }
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;

const StyledButton = styled(Button)`
  padding: 8px;

  @media only screen and ${breakpoints.mobileLarge} {
    padding: 8px 12px;
  }
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  gap: 4px;
`;
