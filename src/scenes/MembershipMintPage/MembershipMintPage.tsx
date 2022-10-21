import { Web3Provider } from '@ethersproject/providers';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BaseM, BaseXL, TitleM, TitleXS } from 'components/core/Text/Text';
import Markdown from 'components/core/Markdown/Markdown';
import { Button } from 'components/core/Button/Button';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';

import ShimmerProvider, { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import ErrorText from 'components/core/Text/ErrorText';
import { useWeb3React } from '@web3-react/core';
import useWalletModal from 'hooks/useWalletModal';
import { useModalActions } from 'contexts/modal/ModalContext';
import {
  useMembershipMintPageActions,
  useMembershipMintPageState,
} from 'contexts/membershipMintPage/MembershipMintPageContext';
import { Contract } from '@ethersproject/contracts';
import { MembershipNft } from './cardProperties';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { GALLERY_FAQ } from 'constants/urls';
import colors from 'components/core/colors';
import { TransactionStatus } from 'constants/transaction';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { ROUTES } from 'constants/routes';

type Props = {
  membershipNft: MembershipNft;
  canMintToken: boolean;
  contract: Contract | null;
  // mintToken actually returns an any type :facepalm:
  // maybe there's a better way to type these
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mintToken: (contract: Contract, tokenId: number) => Promise<any>;
  children?: ReactNode;
  onMintSuccess?: () => void;
};

export function MembershipMintPage({
  membershipNft,
  canMintToken,
  contract,
  mintToken,
  children,
  onMintSuccess,
}: Props) {
  const { active, account } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { hideModal } = useModalActions();
  const [error, setError] = useState('');

  const { totalSupply, remainingSupply, price } = useMembershipMintPageState();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const { getSupply } = useMembershipMintPageActions();

  const buttonText = useMemo(() => {
    if (!active) {
      return 'Connect Wallet';
    }

    if (transactionStatus === TransactionStatus.PENDING) {
      return 'Minting...';
    }

    if (transactionStatus === TransactionStatus.SUCCESS) {
      return 'Mint Successful';
    }

    return canMintToken ? 'Mint Card' : 'Buy on Secondary';
  }, [active, canMintToken, transactionStatus]);

  const isMintButtonEnabled = useMemo(
    () => (Number(price) > 0 || canMintToken) && transactionStatus !== TransactionStatus.PENDING,
    [canMintToken, price, transactionStatus]
  );

  const directUserToSecondary = useMemo(
    () => membershipNft.tokenId === 6 || (active && !canMintToken && transactionStatus === null),
    [active, canMintToken, membershipNft.tokenId, transactionStatus]
  );

  const handleConnectWalletButtonClick = useCallback(() => {
    if (!active) {
      showWalletModal();
    }
  }, [active, showWalletModal]);

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);

      // Need to figure out a better way to type contracts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mintResult = await mintToken(contract, membershipNft.tokenId).catch((error: any) => {
        setError(`Error while calling contract - "${error?.error?.message ?? error?.message}"`);
        setTransactionStatus(TransactionStatus.FAILED);
      });

      if (!mintResult) {
        return;
      }

      if (mintResult.hash) {
        setTransactionHash(mintResult.hash);
      }

      if (typeof mintResult.wait === 'function') {
        // Wait for the transaction to be mined
        const waitResult = await mintResult.wait().catch(() => {
          setTransactionStatus(TransactionStatus.FAILED);
          setError('Transaction failed');
        });
        if (waitResult) {
          setTransactionStatus(TransactionStatus.SUCCESS);
          getSupply(contract, membershipNft.tokenId);

          if (onMintSuccess) {
            onMintSuccess();
          }
        }
      }
    }
  }, [active, contract, error, getSupply, membershipNft.tokenId, mintToken, onMintSuccess]);

  const PrimaryButton = useMemo(() => {
    if (directUserToSecondary) {
      return (
        <StyledSecondaryLink href={membershipNft.secondaryUrl} target="_blank">
          <TitleXS color={colors.white}>View on Secondary</TitleXS>
        </StyledSecondaryLink>
      );
    }

    return active ? (
      <Button disabled={!isMintButtonEnabled} onClick={handleMintButtonClick}>
        {buttonText}
      </Button>
    ) : (
      <Button onClick={handleConnectWalletButtonClick}>{buttonText}</Button>
    );
  }, [
    active,
    buttonText,
    handleConnectWalletButtonClick,
    handleMintButtonClick,
    isMintButtonEnabled,
    membershipNft.secondaryUrl,
    directUserToSecondary,
  ]);

  // auto close the wallet modal once user connects
  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  return (
    <StyledMintPage>
      <StyledContent>
        <MembershipNftVisual src={membershipNft.videoUrl} />
        <StyledDetailText>
          <StyledDetailHeader>
            <VStack gap={16}>
              <TitleM>{membershipNft.title}</TitleM>
              <StyledNftDescription>
                <Markdown text={membershipNft.description} />
              </StyledNftDescription>
            </VStack>
          </StyledDetailHeader>
          <VStack gap={16}>
            {Number(price) > 0 && (
              <VStack>
                <TitleXS>Price</TitleXS>
                <BaseM>{Number(price / 1000000000000000000)} ETH</BaseM>
              </VStack>
            )}
            {Boolean(totalSupply) && (
              <VStack>
                <TitleXS>Available</TitleXS>
                <BaseM>
                  {membershipNft.tokenId === 6 ? 0 : remainingSupply}/{totalSupply}
                </BaseM>
              </VStack>
            )}
            {children}
            {account && (
              <VStack>
                <TitleXS>Connected wallet</TitleXS>
                <BaseM>{account}asdas</BaseM>
              </VStack>
            )}
          </VStack>
          <VStack>
            <StyledHorizontalBreak>
              <HorizontalBreak />
            </StyledHorizontalBreak>
            {active && !canMintToken && transactionStatus === null && (
              <StyledIneligibleText>
                <HStack gap={4} align="center">
                  <BaseXL>You are ineligible for this mint.</BaseXL>
                  <InteractiveLink href={`${GALLERY_FAQ}#6fa1bc2983614500a206fc14fcfd61bf`}>
                    <InfoCircleIcon />
                  </InteractiveLink>
                </HStack>
              </StyledIneligibleText>
            )}
          </VStack>
          <VStack gap={16}>
            {PrimaryButton}
            {transactionHash && (
              <>
                <div>
                  <BaseM>
                    {transactionStatus === TransactionStatus.SUCCESS
                      ? 'Transaction successful!'
                      : 'Transaction submitted. This may take several minutes.'}
                  </BaseM>
                  <GalleryLink href={`https://etherscan.io/tx/${transactionHash}`}>
                    <BaseM>View on Etherscan</BaseM>
                  </GalleryLink>
                </div>
              </>
            )}
            {transactionStatus === TransactionStatus.SUCCESS && (
              <>
                <BaseM>You can now sign up for Gallery.</BaseM>
                <GalleryLink href={ROUTES.AUTH}>
                  <BaseM>Proceed to Onboarding</BaseM>
                </GalleryLink>
              </>
            )}
            {error && <ErrorText message={error} />}
          </VStack>
        </StyledDetailText>
      </StyledContent>
    </StyledMintPage>
  );
}

const StyledDetailText = styled.div`
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
  margin-top: 32px;

  @media only screen and ${breakpoints.tablet} {
    margin-left: 72px;
    margin-top: 0px;
    max-width: 296px;
  }
`;

const StyledDetailHeader = styled.div`
  padding-bottom: 32px;
`;

const StyledNftDescription = styled(BaseM)`
  white-space: pre-line;
`;

type VideoProps = {
  src: string;
};

function MembershipVideo({ src }: VideoProps) {
  const setContentIsLoaded = useSetContentIsLoaded();
  return (
    <StyledVideo src={src} autoPlay loop playsInline muted onLoadedData={setContentIsLoaded} />
  );
}

function MembershipNftVisual({ src }: VideoProps) {
  return (
    <ShimmerProvider>
      <MembershipVideo src={src} />
    </ShimmerProvider>
  );
}

export const StyledMintPage = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  @media only screen and ${breakpoints.mobile} {
    margin-left: ${pageGutter.mobile}px;
    margin-right: ${pageGutter.mobile}px;
    margin-bottom: 64px;
  }

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
    margin-bottom: 0px;
  }

  @media only screen and ${breakpoints.desktop} {
    margin: 0px;
  }
`;

const StyledHorizontalBreak = styled.div`
  padding: 32px 0px;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;

const StyledVideo = styled.video`
  width: 100%;
  @media only screen and ${breakpoints.desktop} {
    height: 600px;
    width: 600px;
  }
`;

const InfoCircleIcon = styled.div`
  height: 16px;
  width: 16px;
  background: url(/icons/info_circle.svg) no-repeat scroll;
`;

const StyledSecondaryLink = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.offBlack};
  cursor: pointer;
  height: 40px;
  text-decoration: none;
  &:hover {
    opacity: 0.8;
  }
`;

const StyledIneligibleText = styled.div`
  padding-bottom: 24px;
`;
