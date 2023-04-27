import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { TransactionStatus } from '~/constants/transaction';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMintMerchContract } from '~/hooks/useContract';
import useMintContractWithQuantity from '~/hooks/useMintContractWithQuantity';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { MAX_NFTS_PER_WALLET } from './constants';

type Props = {
  onMintSuccess: () => void;
  quantity: number;
  tokenId: number;
};

export default function MintButton({ onMintSuccess, quantity, tokenId }: Props) {
  const { pushToast } = useToastActions();
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

      <VStack gap={!isMobile ? 8 : 0}>
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
          <BaseM>It should be in your wallet at the moment</BaseM>
        )}
        {error && (
          <BaseMError color={colors.error} dangerouslySetInnerHTML={{ __html: error }}></BaseMError>
        )}
      </VStack>
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

  // Forces line break on mobile view
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;
