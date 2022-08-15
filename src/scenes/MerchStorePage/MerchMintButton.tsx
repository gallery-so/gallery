import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import { useEffect, useMemo } from 'react';
import { useToastActions } from 'contexts/toast/ToastContext';
import { TransactionStatus } from 'constants/transaction';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';
import { Button } from 'components/core/Button/Button';
import styled from 'styled-components';
import GALLERY_MERCH_CONTRACT_ABI from 'abis/gallery-merch-contract.json';
import { Contract } from '@ethersproject/contracts';
import { useAccount } from 'wagmi';
import { useActiveWeb3React } from 'hooks/useWeb3';
// import { useMintMerchContract } from 'hooks/useContract';

export const GALLERY_MERCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_GALLERY_MERCH_CONTRACT_ADDRESS;

type Props = {
  onMintSuccess: () => void;
  quantity: number;
  tokenId: number;
};

export default function MintButton({ onMintSuccess, quantity, tokenId }: Props) {
  const { pushToast } = useToastActions();
  const { address: rawAddress } = useAccount();
  const { library } = useActiveWeb3React();

  const address = rawAddress?.toLowerCase();

  // FIXME: Check this? This connects to the contract with library.getSigner, would be better to do this in useMintMerchContract();
  // const contract = useMintMerchContract();
  const contract = new Contract(
    GALLERY_MERCH_CONTRACT_ADDRESS || '',
    GALLERY_MERCH_CONTRACT_ABI,
    address && library ? library.getSigner(address).connectUnchecked() : library
  );

  const { transactionHash, transactionStatus, buttonText, error, handleClick } =
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

  const isButtonDisabled = useMemo(() => {
    return transactionStatus === TransactionStatus.PENDING;
  }, [transactionStatus]);

  return (
    <>
      <StyledButton onClick={handleClick} disabled={isButtonDisabled}>
        {buttonText}
      </StyledButton>
      {transactionHash || (address && <Spacer height={16} />)}
      {address && !transactionHash && (
        <>
          <StyledBaseMWithWrap>Connected address: {address}</StyledBaseMWithWrap>
        </>
      )}
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
          <Spacer height={8} />
          <ErrorText message={error} />
        </>
      )}
    </>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 12px 24px;
  text-decoration: none;
`;

const StyledBaseMWithWrap = styled(BaseM)`
  word-break: break-all;
`;
