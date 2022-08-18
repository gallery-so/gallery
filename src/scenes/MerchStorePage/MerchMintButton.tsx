import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
// import ErrorText from 'components/core/Text/ErrorText';
import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import { useEffect, useMemo } from 'react';
import { useToastActions } from 'contexts/toast/ToastContext';
import { TransactionStatus } from 'constants/transaction';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';
import { Button } from 'components/core/Button/Button';
import styled from 'styled-components';
// import GALLERY_MERCH_CONTRACT_ABI from 'abis/gallery-merch-contract.json';
// import { Contract } from '@ethersproject/contracts';
import { useAccount } from 'wagmi';
// import { useActiveWeb3React } from 'hooks/useWeb3';
// import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers';
import { useMintMerchContract } from 'hooks/useContract';
import { MAX_NFTS_PER_WALLET } from './constants';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';

type Props = {
  onMintSuccess: () => void;
  quantity: number;
  tokenId: number;
};

export default function MintButton({ onMintSuccess, quantity, tokenId }: Props) {
  const { pushToast } = useToastActions();

  const { address: rawAddress } = useAccount();
  const address = rawAddress?.toLowerCase();
  const contract = useMintMerchContract();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const { transactionHash, transactionStatus, buttonText, error, handleClick, userOwnedSupply } =
    useMintContractWithQuantity({
      contract,
      tokenId,
      quantity,
    });

  useEffect(() => {
    if (transactionStatus === TransactionStatus.SUCCESS) {
      onMintSuccess();
      pushToast({
        message: 'You’ve succesfully minted merch.',
        autoClose: true,
      });
    }
  }, [transactionStatus, pushToast, onMintSuccess]);

  const isTransactionPending = useMemo(() => {
    return transactionStatus === TransactionStatus.PENDING;
  }, [transactionStatus]);

  const userOwnsMax = useMemo(() => {
    return userOwnedSupply === MAX_NFTS_PER_WALLET;
  }, [userOwnedSupply]);

  const isButtonDisabled = useMemo(() => {
    return isTransactionPending || userOwnsMax;
  }, [isTransactionPending, userOwnsMax]);

  return (
    <>
      <StyledButton onClick={handleClick} disabled={isButtonDisabled}>
        {buttonText}
      </StyledButton>
      {(transactionHash || error) && !isMobile && <Spacer height={16} />}

      {transactionHash && (
        <>
          <BaseM>
            {transactionStatus === TransactionStatus.SUCCESS
              ? 'Transaction successful!'
              : 'Transaction submitted. This may take several minutes.'}
          </BaseM>
          <GalleryLink href={`https://etherscan.io/tx/${transactionHash}`}>
            <BaseM>View on Etherscan</BaseM>
          </GalleryLink>
        </>
      )}
      {transactionStatus === TransactionStatus.SUCCESS && (
        <>
          <BaseM>It should be in your wallet at the moment</BaseM>
        </>
      )}
      {error && (
        <>
          {!isMobile && <Spacer height={8} />}
          {/* <ErrorText message={error} /> */}
          <BaseMError color={colors.error} dangerouslySetInnerHTML={{ __html: error }}></BaseMError>
        </>
      )}
    </>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  padding: 12px 24px;
  text-decoration: none;

  @media (max-width: 768px) {
    width: 176px;
    flex: 1;
  }
`;

const BaseMError = styled(BaseM)`
  color: ${colors.error};

  & a {
    color: ${colors.error};
  }
`;
