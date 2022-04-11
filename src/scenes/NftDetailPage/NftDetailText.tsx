import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import Markdown from 'components/core/Markdown/Markdown';
import NftAdditionalDetails from './NftAdditionalDetails';
import { fullPageHeightWithoutNavbarAndFooter } from 'components/core/Page/constants';
import { useBreakpoint } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useMemo, useRef } from 'react';
import { ENABLED_CONTRACTS } from 'pages/community/[contractAddress]';

type Props = {
  nft: Nft;
  ownerUsername: string;
};

function NftDetailText({ nft, ownerUsername }: Props) {
  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;

  const creatorExists = nft.creator_name || nft.creator_address || nft.asset_contract?.address;

  // useRef to prevent rendered username from briefly changing before fade transition upon route change
  const username = useRef(ownerUsername);

  const showCommunityLink = useMemo(
    () => ENABLED_CONTRACTS.includes(nft.asset_contract?.address),
    [nft.asset_contract?.address]
  );

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      <TitleM>{nft.name}</TitleM>
      <Spacer height={4} />
      {showCommunityLink ? (
        <InteractiveLink to={`/community/${nft.asset_contract.address}`}>
          {nft.token_collection_name}
        </InteractiveLink>
      ) : (
        <BaseM>{nft.token_collection_name}</BaseM>
      )}
      <Spacer height={32} />
      <StyledNftDescription>
        <Markdown text={nft.description} />
      </StyledNftDescription>
      <Spacer height={32} />
      <TitleXS>Owner</TitleXS>
      <InteractiveLink to={`/${username.current}`}>{username.current}</InteractiveLink>
      <Spacer height={16} />
      {creatorExists && (
        <>
          <TitleXS>Created By</TitleXS>
          <BaseM>
            {nft.creator_name || (
              <EnsOrAddress address={nft.creator_address || nft.asset_contract?.address} />
            )}
          </BaseM>
        </>
      )}
      <Spacer height={32} />
      <NftAdditionalDetails nft={nft} />
    </StyledDetailLabel>
  );
}

const StyledDetailLabel = styled.div<{ horizontalLayout: boolean }>`
  display: block;
  max-width: 296px;
  min-width: 296px;
  word-wrap: break-word;

  ${({ horizontalLayout }) =>
    horizontalLayout
      ? `
    max-height: ${fullPageHeightWithoutNavbarAndFooter};
    overflow: auto;
    padding-right: 16px;
    `
      : `
      margin: 40px 0px;
    `}

  @media only screen and ${breakpoints.tablet} {
    margin-left: 72px;
    margin-top: 0;
  }
`;

const StyledNftDescription = styled(BaseM)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

export default NftDetailText;
