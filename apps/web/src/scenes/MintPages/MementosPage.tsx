import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import ActionText from '~/components/core/ActionText/ActionText';
import breakpoints, { contentSize } from '~/components/core/breakpoints';
import HorizontalBreak from '~/components/core/HorizontalBreak/HorizontalBreak';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseXL, TitleL } from '~/components/core/Text/Text';
import { OPENSEA_API_BASEURL, OPENSEA_TESTNET_API_BASEURL } from '~/constants/opensea';
import { GALLERY_MEMENTOS_CONTRACT_ADDRESS } from '~/hooks/useContract';
import useTimer from '~/hooks/useTimer';
import { useIsDesktopWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';
import isProduction from '~/utils/isProduction';

import { MEMENTOS_NFT_TOKEN_ID, MINT_END, MINT_START, pathToImage } from './config';
import MintButton from './MintButton';
import useMintPhase from './useMintPhase';

export default function MementosPage() {
  const isDesktop = useIsDesktopWindowWidth();

  const { address: rawAddress } = useAccount();
  const address = rawAddress?.toLowerCase();
  const [isMinted, setIsMinted] = useState(false);

  const openseaBaseUrl = isProduction() ? OPENSEA_API_BASEURL : OPENSEA_TESTNET_API_BASEURL;

  const detectOwnedPosterNftFromOpensea = useCallback(
    async (address: string) => {
      const response = await fetch(
        `${openseaBaseUrl}/api/v1/assets?owner=${address}&asset_contract_addresses=${GALLERY_MEMENTOS_CONTRACT_ADDRESS}&token_ids=${MEMENTOS_NFT_TOKEN_ID}`,
        {}
      );
      const responseBody = await response.json();
      return responseBody.assets.length > 0;
    },
    [openseaBaseUrl]
  );

  useEffect(() => {
    async function checkIfMinted(address: string) {
      try {
        const hasOwnedPosterNft = await detectOwnedPosterNftFromOpensea(address);
        setIsMinted(hasOwnedPosterNft);
      } catch (_) {
        // ignore if ownership check request fails
      }
    }

    if (address) {
      checkIfMinted(address);
    }
  }, [address, detectOwnedPosterNftFromOpensea]);

  const { push } = useRouter();

  return (
    <StyledPage>
      <StyledBackLink>
        <ActionText onClick={() => push('/trending')}>← Back to gallery</ActionText>
      </StyledBackLink>
      <StyledWrapper>
        <StyledImageContainer>
          <StyledImage src={pathToImage} alt="splash-image" />
        </StyledImageContainer>
        <StyledContent>
          <HStack align="center" gap={4}>
            <StyledTitleL>
              <i>Worlds Beyond</i>
            </StyledTitleL>
          </HStack>
          <VStack gap={16}>
            <BaseM>
              Introducing the <b>Worlds Beyond</b> memento, an emblem of the transformational steps
              Gallery is taking into the exciting world of mobile web3. This limited edition piece
              is both a celebration of the public beta launch of{' '}
              <InteractiveLink href="https://gallery.so/mobile">the Gallery App</InteractiveLink>{' '}
              and a symbol of the endless potential of creativity on-the-go. The memento
              encapsulates the spirit of our mobile-first era, manifesting our commitment to
              delivering unparalleled creative experiences, right in your pocket.
            </BaseM>
            <BaseM>
              You can read more about Gallery Mementos{' '}
              <InteractiveLink href="https://gallery.mirror.xyz/uoO9Fns67sYzX14eRQHiO6sXz2Ojh5qKR0-Sc0F2vZY">
                here
              </InteractiveLink>
              .
            </BaseM>
            <VStack>
              <BaseM>
                Eligibility Criteria
                <StyledUl>
                  <li>
                    Follow{' '}
                    <InteractiveLink href="https://twitter.com/GALLERY">@GALLERY</InteractiveLink>{' '}
                    on Twitter.
                  </li>
                  <li>
                    Reply to the{' '}
                    <InteractiveLink
                      href={
                        process.env.NEXT_PUBLIC_MEMENTO_ANNOUNCEMENT_TWEET_URL ||
                        'https://twitter.com/GALLERY'
                      }
                    >
                      announcement tweet
                    </InteractiveLink>{' '}
                    with your Gallery profile link.
                  </li>
                  <li>
                    On <b>Tues June 27th</b>, a snapshot will be taken of qualifying users
                  </li>
                  <li>
                    Minting will open from 
                    <b>June 27th 2:00PM through July 7th 11:59PM ET</b>
                  </li>
                </StyledUl>
              </BaseM>
              <BaseM>
                <i>Please note that a platform fee of .000777E will be applied per mint.</i>
              </BaseM>
            </VStack>
          </VStack>

          {isDesktop && <HorizontalBreak />}

          {/* May come handy later
          <StyledCallToAction>
            <StyledSecondaryLink href={'https://opensea.io/assets/ethereum/0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b/0'} target="_blank">
              <TitleXS color={colors.white}>View on Secondary</TitleXS>
            </StyledSecondaryLink>
          </StyledCallToAction> */}

          {isMinted ? (
            <BaseXL>You've succesfully minted this token.</BaseXL>
          ) : (
            <StyledCallToAction>
              <Countdown />
              <MintButton onMintSuccess={() => setIsMinted(true)}></MintButton>
            </StyledCallToAction>
          )}
        </StyledContent>
      </StyledWrapper>
    </StyledPage>
  );
}

function Countdown() {
  const phase = useMintPhase();

  const until = useMemo(() => {
    if (phase === 'pre-mint') return MINT_START;
    if (phase === 'active-mint') return MINT_END;
    return '';
  }, [phase]);

  const { timestamp } = useTimer(until);

  return <BaseXL>{until ? timestamp : null}</BaseXL>;
}

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 64px 24px 0px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  @media only screen and ${breakpoints.tablet} {
    padding: 64px 48px 20px;
  }

  @media only screen and ${breakpoints.desktop} {
    padding: 64px 20px 20px;
  }
`;

const StyledBackLink = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 16px 24px;
`;

const StyledImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  padding-bottom: 100px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 48px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: 3fr 2fr;
    padding-bottom: 0;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 370px;
  margin: 0 auto;
  @media (max-width: ${contentSize.desktop}px) {
    margin: 0 auto;
    padding: 0;
  }
`;

const StyledTitleL = styled(TitleL)`
  font-size: 24px;
`;

const StyledUl = styled.ul`
  margin-top: 12px;
  padding-left: 18px;
`;

const StyledCallToAction = styled.div<{ hasEnded?: boolean }>`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: ${({ hasEnded }) => (hasEnded ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
    align-items: center;
    display: grid;
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

// May come handy later
// const StyledSecondaryLink = styled.a`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background: ${colors.black['800']};
//   cursor: pointer;
//   height: 40px;
//   text-decoration: none;
//   &:hover {
//     opacity: 0.8;
//   }
// `;
