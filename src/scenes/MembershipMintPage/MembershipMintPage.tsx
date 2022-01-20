import { Web3Provider } from '@ethersproject/providers';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BodyRegular, Heading } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import Markdown from 'components/core/Markdown/Markdown';
import Button from 'components/core/Button/Button';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';

import ShimmerProvider, { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import ErrorText from 'components/core/Text/ErrorText';
import colors from 'components/core/colors';
import { useWeb3React } from '@web3-react/core';
import useWalletModal from 'hooks/useWalletModal';
import { useModal } from 'contexts/modal/ModalContext';
import {
  useMembershipMintPageActions,
  useMembershipMintPageState,
} from 'contexts/membershipMintPage/MembershipMintPageContext';
import { Contract } from '@ethersproject/contracts';
import { MembershipNft } from './cardProperties';

type Props = {
  membershipNft: MembershipNft;
  canMintToken: boolean;
  contract: Contract | null;
  mintToken: (contract: Contract, tokenId: number) => Promise<any>;
  children?: ReactNode;
  onMintSuccess?: () => void;
};

enum TransactionStatus {
  PENDING,
  SUCCESS,
  FAILED,
}

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
  const { hideModal } = useModal();
  const [error, setError] = useState('');

  const { totalSupply, remainingSupply, price } = useMembershipMintPageState();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const { getSupply } = useMembershipMintPageActions();

  const buttonText = useMemo(() => {
    if (!active) {
      return 'Connect Wallet';
    }

    return 'Mint Card';
  }, [active]);

  const isMintButtonEnabled = useMemo(
    () => (Number(price) > 0 || canMintToken) && transactionStatus !== TransactionStatus.PENDING,
    [canMintToken, price, transactionStatus]
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

  // auto close the wallet modal once user connects
  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  return (
    <StyledMintPage centered>
      <StyledContent>
        <MembershipNftVisual src={membershipNft.videoUrl} />
        <StyledDetailText>
          <Heading>{membershipNft.title}</Heading>
          <Spacer height={16} />
          <StyledNftDescription color={colors.gray50}>
            <Markdown text={membershipNft.description} />
          </StyledNftDescription>
          <Spacer height={32} />
          {Number(price) > 0 && (
            <>
              <BodyRegular color={colors.gray50}>Price</BodyRegular>
              <BodyRegular>{Number(price / 1000000000000000000)} ETH</BodyRegular>
            </>
          )}
          <Spacer height={16} />
          {Boolean(totalSupply) && (
            <>
              <BodyRegular color={colors.gray50}>Available</BodyRegular>
              <BodyRegular>
                {membershipNft.tokenId === 6 ? 0 : remainingSupply}/{totalSupply}
              </BodyRegular>
            </>
          )}
          {children}
          {account && (
            <>
              <Spacer height={16} />
              <BodyRegular color={colors.gray50}>Connected wallet</BodyRegular>
              <BodyRegular>{account}</BodyRegular>
            </>
          )}
          <Spacer height={32} />
          {active ? (
            <Button
              text={buttonText}
              disabled={!isMintButtonEnabled}
              onClick={handleMintButtonClick}
            />
          ) : (
            <Button text={buttonText} onClick={handleConnectWalletButtonClick} />
          )}
          {transactionHash && (
            <>
              <Spacer height={16} />
              <div>
                <BodyRegular>
                  {transactionStatus === TransactionStatus.SUCCESS
                    ? 'Transaction successful!'
                    : 'Transaction submitted. This may take several minutes.'}
                </BodyRegular>
                <GalleryLink href={`https://etherscan.io/tx/${transactionHash}`}>
                  <BodyRegular>View on Etherscan</BodyRegular>
                </GalleryLink>
              </div>
            </>
          )}
          {transactionStatus === TransactionStatus.SUCCESS && (
            <>
              <Spacer height={16} />
              <BodyRegular>You can now sign up for Gallery.</BodyRegular>
              <GalleryLink href="/auth">
                <BodyRegular>Proceed to Onboarding</BodyRegular>
              </GalleryLink>
            </>
          )}
          {error && (
            <>
              <Spacer height={16} />
              <ErrorText message={error} />
            </>
          )}
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

const StyledNftDescription = styled(BodyRegular)`
  white-space: pre-line;
`;

type VideoProps = {
  src: string;
};

function MembershipVideo({ src }: VideoProps) {
  const setContentIsLoaded = useSetContentIsLoaded();
  return <StyledVideo src={src} autoPlay loop playsInline muted onLoadStart={setContentIsLoaded} />;
}

function MembershipNftVisual({ src }: VideoProps) {
  return (
    <ShimmerProvider>
      <MembershipVideo src={src} />
    </ShimmerProvider>
  );
}

export const StyledMintPage = styled(Page)`
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
