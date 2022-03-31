import TextButton from 'components/core/Button/TextButton';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

// The backend converts all token IDs to hexadecimals; here, we convert back
// https://stackoverflow.com/a/53751162
const hexHandler = (str: string) => {
  if (str.length % 2) {
    str = '0' + str;
  }

  const bn = BigInt('0x' + str);
  const d = bn.toString(10);
  return d;
};

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
              <TitleXS>Contract address</TitleXS>
              <InteractiveLink href={`https://etherscan.io/address/${nft.asset_contract.address}`}>
                {nft.asset_contract.address}
              </InteractiveLink>
            </>
          )}
          <Spacer height={16} />
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(nft.opensea_token_id)}</BaseM>
          <Spacer height={16} />
          <StyledLinkContainer>
            {hasContractAddress && (
              <>
                <InteractiveLink href={getOpenseaExternalUrl(nft)}>View on OpenSea</InteractiveLink>
                <Spacer width={16} />
              </>
            )}
            {nft?.external_url !== '' && (
              <InteractiveLink href={nft.external_url}>More Info</InteractiveLink>
            )}
          </StyledLinkContainer>
        </div>
      )}
    </StyledNftAdditionalDetails>
  );
}

const StyledNftAdditionalDetails = styled.div``;

const StyledLinkContainer = styled.div`
  display: flex;
`;

export default NftAdditionalDetails;
