
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
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

function computeRemainingSupply(usedSupply: number, totalSupply: number) {
  return Math.max(totalSupply - usedSupply, 0);
}

function MembershipMintPage({ membershipColor }: Props) {
  const {
    library,
    connector,
    active,
    account,
    activate,
  } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { hideModal } = useModal();

  const contract = useMembershipCardContract();

  const [error, setError] = useState('');
  const [isMintApproved, setIsMintApproved] = useState(false);
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [price, setPrice] = useState(null);

  const membershipProperties = useMemo(() => MEMBERSHIP_PROPERTIES_MAP[membershipColor], [membershipColor]);

  const handleMintButtonClick = useCallback(async () => {
    if (active && contract) {
      // todo: handle success, show success state to user
      const mintResult = await contract.mint(account, membershipProperties.tokenId, { value: price }).catch((error: any) => {
        setError(`Error while calling contract - "${error?.error?.message}"`);
      });
      // todo: figure out what succesfull mint returns so that we can set some success state
      console.log(mintResult);
    }
  }, [account, active, contract, membershipProperties.tokenId, price]);

  const handleConnectWalletButtonClick = useCallback(() => {
    if (!active) {
      showWalletModal();
    }
  }, [active, showWalletModal]);

  // check with the contract whether the user's address is allowed to call mint, and set the result in local state
  const getIsMintApproved = useCallback(async (contract: Contract) => {
    const isMintApprovedResult = await contract.isMintApproved(account, membershipProperties.tokenId);
    setIsMintApproved(isMintApprovedResult);
  }, [account, membershipProperties.tokenId]);

  const getRemainingSupply = useCallback(async (contract: Contract) => {
    const usedSupply = await contract.getPrice(membershipProperties.tokenId);
    setRemainingSupply(computeRemainingSupply(usedSupply, membershipProperties.totalSupply ?? 0));
  }, [membershipProperties.totalSupply, membershipProperties.tokenId]);

  const getPrice = useCallback(async (contract: Contract) => {
    const priceRes = await contract.getPrice(membershipProperties.tokenId);
    setPrice(priceRes);
  }, [membershipProperties.tokenId]);

  useEffect(() => {
    if (contract) {
      // void getIsMintApproved(contract);
      void getRemainingSupply(contract);
      // void getPrice(contract);
    }
  }, [getIsMintApproved, getRemainingSupply, contract, getPrice]);

  // auto close the wallet modal once user connects
  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  // mint button is enabled if price is 0, or price > 0 and user is approved

  const isMintButtonEnabled = useMemo(() => price === 0 || isMintApproved, [isMintApproved, price]);

  return (
    <StyledMintPage centered>
      <div>{account}</div>
      <StyledContent>
        <StyledMedia>
          <ShimmerProvider>
            <MembershipVideo src={membershipProperties.videoUrl}/>
          </ShimmerProvider>
        </StyledMedia>
        <StyledDetailText>
          <Heading>{membershipProperties.title}</Heading>
          <Spacer height={16} />
          <StyledNftDescription color={colors.gray50}>
            {membershipProperties.description}
          </StyledNftDescription>
          <Spacer height={32} />
          {
            membershipProperties.price && <>
              <BodyRegular color={colors.gray50}>Price</BodyRegular>
              <BodyRegular>{membershipProperties.price} ETH</BodyRegular>
            </>
          }
          <Spacer height={16} />
          {
            membershipProperties.totalSupply && <>
              <BodyRegular color={colors.gray50}>Available</BodyRegular>
              <BodyRegular>{remainingSupply}/{membershipProperties.totalSupply}</BodyRegular>
            </>
          }
          <Spacer height={32} />
          {active
            ? <Button text={isMintApproved ? 'Mint Card' : 'Mint Unavailable'} disabled={!isMintButtonEnabled} onClick={handleMintButtonClick}/>
            : <Button text="Connect Wallet" onClick={handleConnectWalletButtonClick}/>
          }
          {error && <>
            <Spacer height={16}/><ErrorText message={error}></ErrorText></>}
        </StyledDetailText>
      </StyledContent>
    </StyledMintPage>);
}

type VideoProps = {
  src: string;
};

function MembershipVideo({ src }: VideoProps) {
  const setContentIsLoaded = useSetContentIsLoaded();
  return (<StyledVideo src={src} autoPlay loop playsInline muted onLoadStart={setContentIsLoaded}/>);
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
const StyledMedia = styled.div`
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
