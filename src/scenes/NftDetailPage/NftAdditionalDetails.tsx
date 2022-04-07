import TextButton from 'components/core/Button/TextButton';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = {
  contractAddress: string;
  tokenId: string;
  externalUrl: string;
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

const getOpenseaExternalUrl = (contractAddress: string, tokenId: string) => {
  const hexTokenId = hexHandler(tokenId);

  // Allows us to get referral credit
  const ref = GALLERY_OS_ADDRESS;

  return `https://opensea.io/assets/${contractAddress}/${hexTokenId}?ref=${ref}`;
};

const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

function NftAdditionalDetails({ contractAddress, tokenId, externalUrl }: Props) {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const handleToggleClick = useCallback(() => {
    setShowAdditionalDetails((value) => !value);
  }, []);

  // Check for contract address befor rendering additional details
  const hasContractAddress = contractAddress !== '';

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
              <InteractiveLink href={`https://etherscan.io/address/${contractAddress}`}>
                {contractAddress}
              </InteractiveLink>
            </>
          )}
          <Spacer height={16} />
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
          <Spacer height={16} />
          <StyledLinkContainer>
            {hasContractAddress && (
              <>
                <InteractiveLink href={getOpenseaExternalUrl(contractAddress, tokenId)}>
                  View on OpenSea
                </InteractiveLink>
                <Spacer width={16} />
              </>
            )}
            {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
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
