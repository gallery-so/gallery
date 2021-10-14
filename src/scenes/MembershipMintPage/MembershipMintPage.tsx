
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
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = {
  title: string;
  description: string;
  quantityLimit?: number;
  price?: number;
};
// contract address, video url,

function MembershipMintPage({ title, description, quantityLimit, price }: Props) {
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

  console.log(contract);

  const handleMintButtonClick = useCallback(async () => {
    // if not connected to wallet connect wallet
    // interact with contract
    if (!active) {
      // activate(injected);
      showWalletModal();
    } else if (contract) {
      const res = await contract.balanceOf(account, '3');
      console.log(BigInt(res).toString(10));
      contract.mint(account, '0').catch((error: any) => {
        setError(`Error while calling contract - "${error.error.message}"`);
      });
    }
  }, [account, active, contract, showWalletModal, setError]);

  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  return (
    <StyledMintPage centered>
      <div>{account}</div>
      <StyledContent>
        <StyledMedia>
          <ShimmerProvider>
            <MembershipVideo/>
          </ShimmerProvider>
        </StyledMedia>
        <StyledDetailText>
          <Heading>{title}</Heading>
          <Spacer height={16} />
          <BodyRegular>Gallery</BodyRegular>
          <Spacer height={16} />
          <StyledNftDescription color={colors.gray50}>
            {description}
          </StyledNftDescription>
          <Spacer height={32} />
          {
            price && <>
              <BodyRegular color={colors.gray50}>Price</BodyRegular>
              <BodyRegular>{price} ETH</BodyRegular>
            </>
          }
          <Spacer height={16} />
          {
            quantityLimit && <>
              <BodyRegular color={colors.gray50}>Available</BodyRegular>
              <BodyRegular>500/{quantityLimit}</BodyRegular>
            </>
          }
          <Spacer height={32} />
          <Button text={active ? 'Mint Card' : 'Connect Wallet to Mint Card'} onClick={handleMintButtonClick}/>
          {error && <>
            <Spacer height={16}/><ErrorText message={error}></ErrorText></>}
        </StyledDetailText>
      </StyledContent>
    </StyledMintPage>);
}

function MembershipVideo() {
  const setContentIsLoaded = useSetContentIsLoaded();
  return (<StyledVideo
    src="https://storage.opensea.io/files/2d7d9d1e1816157c0de82bd21fc6d185.mp4" autoPlay loop playsInline muted onLoadStart={setContentIsLoaded}/>);
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
