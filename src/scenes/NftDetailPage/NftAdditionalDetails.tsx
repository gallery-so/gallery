import TextButton from 'components/core/Button/TextButton';
import { FeatureFlag } from 'components/core/enums';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useRefreshToken } from 'hooks/api/tokens/useRefreshToken';
import { useCallback, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { NftAdditionalDetailsQuery } from '__generated__/NftAdditionalDetailsQuery.graphql';

type Props = {
  authenticatedUserOwnsAsset: boolean;
  contractAddress: string | null;
  tokenId: string | null;
  dbId: string | null;
  externalUrl: string | null;
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

function NftAdditionalDetails({
  authenticatedUserOwnsAsset,
  contractAddress,
  dbId,
  tokenId,
  externalUrl,
}: Props) {
  const query = useLazyLoadQuery<NftAdditionalDetailsQuery>(
    graphql`
      query NftAdditionalDetailsQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = useRefreshToken();
  const { pushToast } = useToastActions();

  const handleToggleClick = useCallback(() => {
    setShowDetails((value) => !value);
  }, []);

  const handleRefreshMetadata = useCallback(async () => {
    try {
      if (!dbId) return;
      setIsRefreshing(true);
      pushToast({
        message: 'This piece is being updated with the latest metadata. Check back in few minutes.',
        autoClose: true,
      });
      await refreshToken(dbId);
    } catch (err) {
      pushToast({
        message: err.message,
        autoClose: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [dbId, pushToast, refreshToken]);

  // Check for contract address befor rendering additional details
  const hasContractAddress = contractAddress !== null && contractAddress !== '' && tokenId;

  return (
    <StyledNftAdditionalDetails>
      {!showDetails && <TextButton text="Show Details" onClick={handleToggleClick} />}
      {showDetails && (
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
          {tokenId && <BaseM>{hexHandler(tokenId)}</BaseM>}
          <Spacer height={16} />
          <StyledLinkContainer>
            {hasContractAddress && (
              <>
                <InteractiveLink href={getOpenseaExternalUrl(contractAddress, tokenId)}>
                  View on OpenSea
                </InteractiveLink>
                {isFeatureEnabled(FeatureFlag.REFRESH_METADATA, query) &&
                  authenticatedUserOwnsAsset && (
                    <InteractiveLink onClick={handleRefreshMetadata} disabled={isRefreshing}>
                      Refresh metadata
                    </InteractiveLink>
                  )}
              </>
            )}
            {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
          </StyledLinkContainer>
          <Spacer height={12} />
          <TextButton text="Hide Details" onClick={handleToggleClick} />
        </div>
      )}
    </StyledNftAdditionalDetails>
  );
}

const StyledNftAdditionalDetails = styled.div``;

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default NftAdditionalDetails;
