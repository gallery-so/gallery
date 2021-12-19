import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Markdown from 'components/core/Markdown/Markdown';
import Page from 'components/core/Page/Page';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BodyRegular, Heading } from 'components/core/Text/Text';
import { useModal } from 'contexts/modal/ModalContext';
import ShimmerProvider, { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMembershipCardContract } from 'hooks/useContract';
import useWalletModal from 'hooks/useWalletModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { MembershipColor, MEMBERSHIP_PROPERTIES_MAP } from './cardProperties';

type Props = {
  membershipColor: MembershipColor;
};

enum TransactionStatus {
  PENDING,
  SUCCESS,
  FAILED,
}

function computeRemainingSupply(usedSupply: number, totalSupply: number) {
  return Math.max(totalSupply - usedSupply, 0);
}

function MembershipMintPage({ membershipColor }: Props) {
  const { active, account } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { hideModal } = useModal();

  const contract = useMembershipCardContract();

  const [error, setError] = useState('');
  const [canMintToken, setCanMintToken] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [price, setPrice] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);

  const membershipProperties = useMemo(
    () => MEMBERSHIP_PROPERTIES_MAP[membershipColor],
    [membershipColor]
  );
  // check the contract whether the user's address is allowed to call mint, and set the result in local state
  const getCanMintToken = useCallback(
    async (contract: Contract) => {
      if (account) {
        const canMintTokenResult = await contract.canMintToken(
          account,
          membershipProperties.tokenId
        );
        setCanMintToken(canMintTokenResult);
      }
    },
    [account, membershipProperties.tokenId]
  );

  const getSupply = useCallback(
    async (contract: Contract) => {
      const usedSupply = await contract.getUsedSupply(membershipProperties.tokenId);
      const totalSupply = await contract.getTotalSupply(membershipProperties.tokenId);

      setTotalSupply(Number(totalSupply));
      setRemainingSupply(computeRemainingSupply(Number(usedSupply), totalSupply));
    },
    [membershipProperties.tokenId]
  );

  const getPrice = useCallback(
    async (contract: Contract) => {
      const priceResponse = await contract.getPrice(membershipProperties.tokenId);
      setPrice(priceResponse);
    },
    [membershipProperties.tokenId]
  );

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      const mintResult = await contract
        .mint(account, membershipProperties.tokenId, { value: price })
        .catch((error: any) => {
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
          await getSupply(contract);
          await getCanMintToken(contract);
        }
      }
    }
  }, [
    account,
    active,
    contract,
    error,
    getCanMintToken,
    getSupply,
    membershipProperties.tokenId,
    price,
  ]);

  const handleConnectWalletButtonClick = useCallback(() => {
    if (!active) {
      showWalletModal();
    }
  }, [active, showWalletModal]);

  const isMintButtonEnabled = useMemo(
    () => (Number(price) > 0 || canMintToken) && transactionStatus !== TransactionStatus.PENDING,
    [canMintToken, price, transactionStatus]
  );

  const buttonText = useMemo(() => {
    switch (transactionStatus) {
      case TransactionStatus.PENDING:
        return 'Minting...';
      case TransactionStatus.SUCCESS:
        return 'Mint Successful';
      case TransactionStatus.FAILED:
        return 'Mint Failed - Try Again';
    }

    if (!active) {
      return 'Connect Wallet';
    }

    if (!canMintToken || (totalSupply > 0 && remainingSupply === 0)) {
      return 'Mint Unavailable';
    }

    return 'Mint Card';
  }, [active, canMintToken, remainingSupply, totalSupply, transactionStatus]);

  useEffect(() => {
    if (contract) {
      void getCanMintToken(contract);
      void getSupply(contract);
      void getPrice(contract);
    }
  }, [getCanMintToken, getSupply, contract, getPrice]);

  // auto close the wallet modal once user connects
  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  return (
    <StyledMintPage centered>
      <StyledContent>
        <div>
          <ShimmerProvider>
            <MembershipVideo src={membershipProperties.videoUrl} />
          </ShimmerProvider>
        </div>
        <StyledDetailText>
          <Heading>{membershipProperties.title}</Heading>
          <Spacer height={16} />
          <StyledNftDescription color={colors.gray50}>
            <Markdown text={membershipProperties.description} />
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
                {membershipProperties.tokenId === 6 ? 0 : remainingSupply}/{totalSupply}
              </BodyRegular>
            </>
          )}
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
              <GalleryLink to="/auth">
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

type VideoProps = {
  src: string;
};

function MembershipVideo({ src }: VideoProps) {
  const setContentIsLoaded = useSetContentIsLoaded();
  return <StyledVideo src={src} autoPlay loop playsInline muted onLoadStart={setContentIsLoaded} />;
}

const StyledMintPage = styled(Page)`
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

const StyledVideo = styled.video`
  width: 100%;
  @media only screen and ${breakpoints.desktop} {
    height: 600px;
    width: 600px;
  }
`;
export default MembershipMintPage;
