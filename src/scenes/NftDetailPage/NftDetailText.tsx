import { Heading, BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import colors from 'components/core/colors';
import breakpoints, { size } from 'components/core/breakpoints';
import styled from 'styled-components';
import { Nft, Owner } from 'types/Nft';
import Markdown from 'components/core/Markdown/Markdown';
import { useMemo } from 'react';
import NftAdditionalDetails from './NftAdditionalDetails';
import { fullPageHeightWithoutNavbarAndFooter } from 'components/core/Page/constants';
import { useBreakpoint } from 'hooks/useWindowSize';
import { EnsOrAddress } from 'components/EnsOrAddress';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';

type Props = {
  nft: Nft;
  ownerUsername: string;
};

function NftDetailText({ nft, ownerUsername }: Props) {
  const breakpoint = useBreakpoint();
  const horizontalLayout = breakpoint === size.desktop || breakpoint === size.tablet;

  const creatorExists = nft.creator_name || nft.creator_address || nft.asset_contract?.address;

  return (
    <StyledDetailLabel horizontalLayout={horizontalLayout}>
      <TitleM>{nft.name}</TitleM>
      <Spacer height={4} />
      <BaseM>{nft.token_collection_name}</BaseM>
      <Spacer height={32} />
      <StyledNftDescription>
        <Markdown text={nft.description} />
      </StyledNftDescription>
      <Spacer height={32} />
      <TitleXS>Owner</TitleXS>
      <InteractiveLink to={`/${ownerUsername}`}>{ownerUsername}</InteractiveLink>
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

const StyledLink = styled.a`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledNftDescription = styled(BaseM)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

export default NftDetailText;
