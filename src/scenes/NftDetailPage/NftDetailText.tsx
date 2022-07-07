import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import Markdown from 'components/core/Markdown/Markdown';
import NftAdditionalDetails from './NftAdditionalDetails';
import { useBreakpoint, useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { useMemo, useRef } from 'react';
import { DISABLED_CONTRACTS } from 'pages/community/[contractAddress]';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';

type Props = {
  name: string | null;
  description: string | null;
  ownerUsername: string;
  authenticatedUserOwnsAsset: boolean;
  contractAddress: string | null;
  tokenId: string | null;
  dbId: string | null;
  externalUrl: string | null;
  // TODO [GAL-206]: support Creator Address post-merge
  // creatorAddress: string | null;
  contractName: string | null;
};

function NftDetailText({
  name,
  description,
  ownerUsername,
  contractAddress,
  tokenId,
  dbId,
  externalUrl,
  authenticatedUserOwnsAsset,
  // TODO [GAL-206]: support Creator Address post-merge
  // creatorAddress,
  contractName,
}: Props) {
  const isMobile = useIsMobileWindowWidth();
  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;
  // TODO [GAL-206]: support Creator Address post-merge
  // const addressToUse = creatorAddress || contractAddress || '';
  const addressToUse = contractAddress || '';

  // useRef to prevent rendered username from briefly changing before fade transition upon route change
  const username = useRef(ownerUsername);

  const showCommunityLink = useMemo(
    () => !!contractAddress && !DISABLED_CONTRACTS.includes(contractAddress),
    [contractAddress]
  );

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      {name && (
        <>
          <TitleM>{name}</TitleM>
          <Spacer height={4} />
        </>
      )}
      {contractName && showCommunityLink ? (
        <InteractiveLink to={`/community/${contractAddress}`}>{contractName}</InteractiveLink>
      ) : (
        <BaseM>{contractName}</BaseM>
      )}
      <Spacer height={isMobile ? 32 : 24} />
      {description && (
        <>
          <StyledNftDescription>
            <Markdown text={description} />
          </StyledNftDescription>
          <Spacer height={isMobile ? 32 : 24} />
        </>
      )}
      <TitleXS>Owner</TitleXS>
      <InteractiveLink to={`/${username.current}`}>{username.current}</InteractiveLink>
      <Spacer height={16} />
      {addressToUse && (
        <>
          <TitleXS>Creator</TitleXS>
          <BaseM>{<EnsOrAddress address={addressToUse} />}</BaseM>
        </>
      )}
      <Spacer height={24} />
      <NftAdditionalDetails
        contractAddress={contractAddress}
        tokenId={tokenId}
        dbId={dbId}
        externalUrl={externalUrl}
        authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
      />
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
    max-height: calc(100vh - ${GLOBAL_NAVBAR_HEIGHT * 2}px);
    overflow: auto;
    padding-right: 16px;
    `
      : `
      margin: 32px 0px;
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
