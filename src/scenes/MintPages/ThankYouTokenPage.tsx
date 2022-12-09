import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ActionText from '~/components/core/ActionText/ActionText';
import breakpoints, { contentSize, pageGutter } from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import HorizontalBreak from '~/components/core/HorizontalBreak/HorizontalBreak';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseXL, TitleM } from '~/components/core/Text/Text';
import StyledBackLink from '~/components/NavbarBackLink/NavbarBackLink';
import { OPENSEA_API_BASEURL, OPENSEA_TESTNET_API_BASEURL } from '~/constants/opensea';

import { GALLERY_MEMENTOS_CONTRACT_ADDRESS } from '~/hooks/useContract';
import useTimer from '~/hooks/useTimer';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import isProduction from '~/utils/isProduction';
import MintButton from './MintButton';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useAccount } from 'wagmi';

export default function ThankYouTokenPage() {
  const isMobile = useIsMobileWindowWidth();

  const POSTER_IMAGE_URL =
    'https://storage.googleapis.com/gallery-prod-325303.appspot.com/g_frame.png';
  const POSTER_SECONDARY_URL =
    'https://opensea.io/assets/ethereum/0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b/0';

  const handleBackClick = () => {
    window.history.back();
  };

  const MINT_DEADLINE = '2022-12-18T23:59:59-04:00'; // time is in EST (GMT-04:00)
  const NFT_TOKEN_ID = 1;

  const { timestamp } = useTimer(MINT_DEADLINE);
  const { address: rawAddress } = useAccount();
  const address = rawAddress?.toLowerCase();
  const [isMinted, setIsMinted] = useState(false);

  const openseaBaseUrl = isProduction() ? OPENSEA_API_BASEURL : OPENSEA_TESTNET_API_BASEURL;

  const detectOwnedPosterNftFromOpensea = useCallback(
    async (address: string) => {
      const response = await fetch(
        `${openseaBaseUrl}/api/v1/assets?owner=${address}&asset_contract_addresses=${GALLERY_MEMENTOS_CONTRACT_ADDRESS}&token_ids=${NFT_TOKEN_ID}`,
        {}
      );

      const responseBody = await response.json();
      return responseBody.assets.length > 0;
    },
    [openseaBaseUrl]
  );

  useEffect(() => {
    async function checkIfMinted(address: string) {
      const hasOwnedPosterNft = await detectOwnedPosterNftFromOpensea(address);
      setIsMinted(hasOwnedPosterNft);
    }

    if (address) {
      checkIfMinted(address);
    }
  }, [address, detectOwnedPosterNftFromOpensea]);

  const queryClient = new QueryClient();

  return (
    <StyledPage>
      <QueryClientProvider client={queryClient}>
        <StyledPositionedBackLink>
          <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
        </StyledPositionedBackLink>
        <StyledWrapper>
          <StyledImageContainer>
            <StyledImage src={POSTER_IMAGE_URL} />
          </StyledImageContainer>
          <StyledContent>
            <TitleM>The Next Era of Self Expression</TitleM>
            <VStack gap={16}>
              <BaseM>
                Gallery is a limitless social canvas of curation and connection for your digital
                objects. Now open to everyone.
              </BaseM>
              <BaseM>
                This commemorative token is available to our most active users, as well as early
                adopters of our social features. Connect your wallet to see if you are eligible.
              </BaseM>
              <BaseM>Thank you for being a member of Gallery.</BaseM>
              <BaseM>Minting is available until 12/18/22 on Ethereum. 1 mint per address.</BaseM>
              {/* <BaseM>Minting is now closed. Thank you to everyone who minted one.</BaseM> */}
            </VStack>

            {!isMobile && <HorizontalBreak />}

            {/* <StyledCallToAction>
            <StyledSecondaryLink href={POSTER_SECONDARY_URL} target="_blank">
              <TitleXS color={colors.white}>View on Secondary</TitleXS>
            </StyledSecondaryLink>
          </StyledCallToAction> */}

            <>
              {isMinted ? (
                <BaseXL>You've succesfully minted this poster.</BaseXL>
              ) : (
                <StyledCallToAction>
                  <BaseXL>{timestamp}</BaseXL>
                  <MintButton onMintSuccess={() => setIsMinted(true)}></MintButton>
                </StyledCallToAction>
              )}
            </>
          </StyledContent>
        </StyledWrapper>
      </QueryClientProvider>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 64px 16px 0px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  @media only screen and ${breakpoints.desktop} {
    padding: 64px 40px 20px;
  }
`;

const StyledImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledImage = styled.img`
  margin: 0 auto;
  max-width: 100%;
  max-height: 600px;

  @media only screen and ${breakpoints.tablet} {
    justify-content: flex-start;

    width: initial;
  }
`;

const StyledPositionedBackLink = styled(StyledBackLink)`
  top: -0;
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  padding-bottom: 100px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-bottom: 0;
  }
`;
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 ${pageGutter.mobile}px;
  max-width: 360px;
  margin: 0 auto;
  @media (max-width: ${contentSize.desktop}px) {
    margin: 0;
    padding: 0;
  }
`;

const StyledCallToAction = styled.div<{ hasEnded?: boolean }>`
  text-align: center;
  display: grid;
  gap: 12px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: ${({ hasEnded }) => (hasEnded ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
    align-items: center;
    text-align: ${({ hasEnded }) => (hasEnded ? 'center' : 'left')};
    position: fixed;
    z-index: 30;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${colors.white};
    padding: 12px 16px;
    border-top: 1px solid ${colors.porcelain};
  }
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
