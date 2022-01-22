import ActionText from 'components/core/ActionText/ActionText';
import TextButton from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BodyRegular } from 'components/core/Text/Text';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

// If the address contains alphabetical characters, it is hexidecimal, and we convert it
// TODO: Fix parseInt() for long strings (> 21 characters?), when JS converts to scientific
// Example: https://gallery.so/robin/21Qt76R6bIyM7fIDsBsgU9DrKCg/21R0nPXR1nlqXP9UD8hn7CQUsUP
const hexHandler = (str: string) => (/[a-zA-Z]/.test(str) ? parseInt(str, 16) : str);

const getOpenseaExternalUrl = (nft: Nft) => {
  const contractAddress = nft.asset_contract.address;
  const tokenId = hexHandler(nft.opensea_token_id);

  // Allows us to get referral credit
  const ref = GALLERY_OS_ADDRESS;

  return `https://opensea.io/assets/${contractAddress}/${tokenId}?ref=${ref}`;
};

const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

function NftAdditionalDetails({ nft }: Props) {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const handleToggleClick = useCallback(() => {
    setShowAdditionalDetails((value) => !value);
  }, []);

  // Check for contract address befor rendering additional details
  const hasContractAddress = nft.asset_contract?.address !== '';

  return (
    <StyledNftAdditionalDetails>
      <TextButton
        text={showAdditionalDetails ? 'Hide Details' : 'Additional Details'}
        onClick={handleToggleClick}
      />
      <Spacer height={12} />
      {showAdditionalDetails && (
        <div>
          {hasContractAddress && (
            <>
              <BodyRegular color={colors.gray50}>Contract address</BodyRegular>
              <StyledLink
                href={`https://etherscan.io/address/${nft.asset_contract.address}`}
                target="_blank"
                rel="noreferrer"
              >
                <BodyRegular>{nft.asset_contract.address}</BodyRegular>
              </StyledLink>
            </>
          )}
          <Spacer height={16} />
          <BodyRegular color={colors.gray50}>Token ID</BodyRegular>
          <BodyRegular>{hexHandler(nft.opensea_token_id)}</BodyRegular>
          <Spacer height={16} />
          {hasContractAddress && (
            <StyledLinkContainer>
              <StyledLink href={getOpenseaExternalUrl(nft)} target="_blank" rel="noreferrer">
                <ActionText color={colors.gray50}>View on OpenSea</ActionText>
              </StyledLink>
              <Spacer width={16} />
            </StyledLinkContainer>
          )}
        </div>
      )}
    </StyledNftAdditionalDetails>
  );
}

const StyledNftAdditionalDetails = styled.div``;

const StyledLink = styled.a`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

export default NftAdditionalDetails;
