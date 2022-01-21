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

const hex = (str: string) => parseInt(str, 16);
const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

function NftAdditionalDetails({ nft }: Props) {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const handleToggleClick = useCallback(() => {
    setShowAdditionalDetails((value) => !value);
  }, []);

  return (
    <StyledNftAdditionalDetails>
      <TextButton
        text={showAdditionalDetails ? 'Hide Details' : 'Additional Details'}
        onClick={handleToggleClick}
      />
      <Spacer height={12} />
      {showAdditionalDetails && (
        <div>
          {nft.asset_contract.address && nft.asset_contract.address !== '' && (
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
          <BodyRegular>{hex(nft.opensea_token_id)}</BodyRegular>
          <Spacer height={16} />
          {nft.asset_contract.address && nft.asset_contract.address !== '' && (
            <StyledLinkContainer>
              <StyledLink
                href={`https://opensea.io/assets/${nft.asset_contract.address}/${hex(
                  nft.opensea_token_id
                )}?ref=${GALLERY_OS_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
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
