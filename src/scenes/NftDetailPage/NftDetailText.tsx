import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import Markdown from 'components/core/Markdown/Markdown';
import NftAdditionalDetails from './NftAdditionalDetails';
import { fullPageHeightWithoutNavbarAndFooter } from 'components/core/Page/constants';
import { useBreakpoint } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';

type Props = {
  name: string | null;
  description: string | null;
  ownerUsername: string;
  contractAddress: string | null;
  tokenId: string | null;
  externalUrl: string | null;
  creatorAddress: string | null;
  openseaCollectionName: string | null;
};

function NftDetailText({
  name,
  description,
  ownerUsername,
  contractAddress,
  tokenId,
  externalUrl,
  creatorAddress,
  openseaCollectionName,
}: Props) {
  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;
  const addressToUse = creatorAddress || contractAddress || '';

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      {name && (
        <>
          <TitleM>{name}</TitleM>
          <Spacer height={4} />
        </>
      )}
      {openseaCollectionName && <BaseM>{openseaCollectionName}</BaseM>}
      <Spacer height={32} />
      {description && (
        <>
          <StyledNftDescription>
            <Markdown text={description} />
          </StyledNftDescription>
          <Spacer height={32} />
        </>
      )}
      <TitleXS>Owner</TitleXS>
      <InteractiveLink to={`/${ownerUsername}`}>{ownerUsername}</InteractiveLink>
      <Spacer height={16} />
      {addressToUse && (
        <>
          <TitleXS>Created By</TitleXS>
          <BaseM>{<EnsOrAddress address={addressToUse} />}</BaseM>
        </>
      )}
      <Spacer height={32} />
      <NftAdditionalDetails
        contractAddress={contractAddress}
        tokenId={tokenId}
        externalUrl={externalUrl}
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
