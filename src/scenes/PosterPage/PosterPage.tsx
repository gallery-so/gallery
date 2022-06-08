import styled from 'styled-components';
import { BaseM, BaseXL, TitleM } from 'components/core/Text/Text';
import breakpoints, { contentSize, pageGutter } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import ActionText from 'components/core/ActionText/ActionText';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useTimer from 'hooks/useTimer';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import { MINT_DATE, NFT_TOKEN_ID } from 'constants/poster';
import PosterMintButton from './PosterMintButton';
import { GALLERY_MEMENTOS_CONTRACT_ADDRESS } from 'hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState, useCallback } from 'react';
import { OPENSEA_API_BASEURL, OPENSEA_TESTNET_API_BASEURL } from 'constants/opensea';
import Spacer from 'components/core/Spacer/Spacer';
import { FeatureFlag } from 'components/core/enums';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import isProduction from 'utils/isProduction';
import { graphql, useFragment } from 'react-relay';
import { PosterPageFragment$key } from '__generated__/PosterPageFragment.graphql';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';

type Props = {
  queryRef: PosterPageFragment$key;
};

export default function PosterPage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment PosterPageFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();

  const POSTER_IMAGE_URL =
    'https://lh3.googleusercontent.com/Q9zjkyRRAugfSBDfqiuyoefUEglPb6Zt5kj9cn-NzavEEBx_JmCaeSdbasI6V9VlkyWtJtVm1lH3VhHBNhj5ZwzEZ6zvfxF0wnFjoQ=h1200';
  const BRAND_POST_URL = 'https://gallery.mirror.xyz/1jgwdWHqYF1dUQ0YoYf-hEpd-OgJ79dZ5L00ArBQzac';

  const { timestamp } = useTimer(MINT_DATE);
  const { account: rawAccount } = useWeb3React<Web3Provider>();
  const account = rawAccount?.toLowerCase();
  const [isMinted, setIsMinted] = useState(false);

  const handleBackClick = () => {
    window.history.back();
  };

  const openseaBaseUrl = isProduction() ? OPENSEA_API_BASEURL : OPENSEA_TESTNET_API_BASEURL;

  const detectOwnedPosterNftFromOpensea = useCallback(
    async (account: string) => {
      const response = await fetch(
        `${openseaBaseUrl}/api/v1/assets?owner=${account}&asset_contract_addresses=${GALLERY_MEMENTOS_CONTRACT_ADDRESS}&token_ids=${NFT_TOKEN_ID}`,
        {}
      );

      const responseBody = await response.json();
      return responseBody.assets.length > 0;
    },
    [openseaBaseUrl]
  );

  useEffect(() => {
    async function checkIfMinted(account: string) {
      const hasOwnedPosterNft = await detectOwnedPosterNftFromOpensea(account);
      setIsMinted(hasOwnedPosterNft);
    }

    if (account) {
      checkIfMinted(account);
    }
  }, [account, detectOwnedPosterNftFromOpensea]);

  return (
    <StyledPage>
      <StyledPositionedBackLink>
        <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
      </StyledPositionedBackLink>
      <StyledWrapper>
        <StyledPosterImage src={POSTER_IMAGE_URL} />
        <StyledContent>
          <TitleM>2022 Community Poster</TitleM>
          <StyledParagraph>
            <BaseM>
              Thank you for being a member of Gallery. Members celebrated our{' '}
              <InteractiveLink href={BRAND_POST_URL}>new brand</InteractiveLink> by signing our
              poster.
            </BaseM>
            <Spacer height={8} />
            <BaseM>
              We are making the final poster available to mint as a commemorative token for early
              believers in our mission and product.
            </BaseM>
            <Spacer height={8} />

            <BaseM>Limit 1 per wallet address.</BaseM>
          </StyledParagraph>

          {!isMobile && <HorizontalBreak />}

          {isFeatureEnabled(FeatureFlag.POSTER_MINT, query) ? (
            <>
              {isMinted ? (
                <BaseXL>You've succesfully minted this poster.</BaseXL>
              ) : (
                <StyledCallToAction>
                  <BaseXL>{timestamp}</BaseXL>
                  <PosterMintButton onMintSuccess={() => setIsMinted(true)}></PosterMintButton>
                </StyledCallToAction>
              )}
            </>
          ) : (
            <StyledCallToAction hasEnded>
              <BaseXL>Mint opening soon.</BaseXL>
            </StyledCallToAction>
          )}
        </StyledContent>
      </StyledWrapper>
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

const StyledPosterImage = styled.img`
  border: 1px solid ${colors.porcelain};
  margin: 0 auto;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    justify-content: flex-start;
    height: 600px;
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

const StyledParagraph = styled.div`
  display: grid;
  gap: 8px;
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
