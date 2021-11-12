import { Heading, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';

import colors from 'components/core/colors';
import breakpoints from 'components/core/breakpoints';
import styled from 'styled-components';
import { Nft, Owner } from 'types/Nft';
import Markdown from 'components/core/Markdown/Markdown';
import { useMemo } from 'react';
import NftAdditionalDetails from './NftAdditionalDetails';

type Props = {
  nft: Nft;
};

function NftDetailText({ nft }: Props) {
  const currentOwner = useMemo((): Owner => {
    const owners = nft.ownership_history?.owners;
    return owners.length > 0 ? owners[0] : {};
  }, [nft]);

  return (
    <StyledDetailLabel>
      <Heading>{nft.name}</Heading>
      <Spacer height={16} />
      <BodyRegular>{nft.token_collection_name}</BodyRegular>
      <Spacer height={16} />
      <StyledNftDescription color={colors.gray50}>
        <Markdown text={nft.description} />
      </StyledNftDescription>
      <Spacer height={32} />
      <BodyRegular color={colors.gray50}>Owned By</BodyRegular>
      <NftOwnerLink owner={currentOwner} ownerAddress={nft.owner_address}/>
      <Spacer height={16} />
      <BodyRegular color={colors.gray50}>Created By</BodyRegular>
      <BodyRegular>{nft.creator_name || nft.creator_address}</BodyRegular>
      <Spacer height={32} />
      <NftAdditionalDetails nft={nft}/>
    </StyledDetailLabel>
  );
}

type NftOwnerProps = {
  owner: Owner;
  ownerAddress: string;
};

function NftOwnerLink({ owner, ownerAddress }: NftOwnerProps) {
  if (owner.username) {
    return (<StyledLink href={`/${owner.username}`}>
      <BodyRegular>{owner.username}</BodyRegular>
    </StyledLink>);
  }

  // use the ownership_history owner's address, fallback to the nft owner address
  const address = owner?.address ?? ownerAddress;

  return (<StyledLink
    href={`https://etherscan.io/address/${address}`}
    target="_blank"
    rel="noreferrer"
  >
    <BodyRegular>{address}</BodyRegular>
  </StyledLink>);
}

const StyledDetailLabel = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 296px;
  min-width: 296px;
  margin-top: 32px;
  word-wrap: break-word;

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

const StyledNftDescription = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

export default NftDetailText;
