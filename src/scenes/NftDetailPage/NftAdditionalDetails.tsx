import TextButton from 'components/core/Button/TextButton';
import { FeatureFlag } from 'components/core/enums';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useRefreshToken } from 'hooks/api/tokens/useRefreshToken';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { NftAdditionalDetailsQuery } from '__generated__/NftAdditionalDetailsQuery.graphql';
import { NftAdditionalDetailsFragment$key } from '../../../__generated__/NftAdditionalDetailsFragment.graphql';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

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

export const getOpenseaExternalUrl = (contractAddress: string, tokenId: string) => {
  const hexTokenId = hexHandler(tokenId);

  // Allows us to get referral credit
  const ref = GALLERY_OS_ADDRESS;

  return `https://opensea.io/assets/${contractAddress}/${hexTokenId}?ref=${ref}`;
};

const GALLERY_OS_ADDRESS = '0x8914496dc01efcc49a2fa340331fb90969b6f1d2';

type Props = {
  tokenRef: NftAdditionalDetailsFragment$key;
};

function NftAdditionalDetails({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsFragment on Token {
        dbid
        tokenId
        externalUrl
        contract {
          contractAddress {
            address
          }
        }
      }
    `,
    tokenRef
  );

  // TODO: We should thread a query ref down to this somehow
  const query = useLazyLoadQuery<NftAdditionalDetailsQuery>(
    graphql`
      query NftAdditionalDetailsQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const [showDetails, setShowDetails] = useState(false);

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [refreshToken, isRefreshing] = useRefreshToken();

  const { dbid, tokenId, contract, externalUrl } = token;

  const handleToggleClick = useCallback(() => {
    setShowDetails((value) => !value);
  }, []);

  const handleRefreshMetadata = useCallback(async () => {
    try {
      pushToast({
        message: 'This piece is being updated with the latest metadata. Check back in few minutes.',
        autoClose: true,
      });

      await refreshToken(dbid);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reportError(error);

        pushToast({
          message: error.message,
          autoClose: true,
        });
      } else {
        reportError('Error while refreshing token, unknown error');

        pushToast({
          message: "Something went wrong, we're looking into it now.",
        });
      }
    }
  }, [dbid, pushToast, refreshToken, reportError]);

  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(contract.contractAddress.address, tokenId);
    }

    return null;
  }, [contract?.contractAddress?.address, tokenId]);

  return (
    <StyledNftAdditionalDetails>
      {!showDetails && <TextButton text="Show Details" onClick={handleToggleClick} />}
      {showDetails && (
        <div>
          {contract?.contractAddress?.address && (
            <>
              <TitleXS>Contract address</TitleXS>
              <InteractiveLink
                href={`https://etherscan.io/address/${contract.contractAddress.address}`}
              >
                {contract.contractAddress.address}
              </InteractiveLink>
            </>
          )}
          <Spacer height={16} />
          <TitleXS>Token ID</TitleXS>
          {tokenId && <BaseM>{hexHandler(tokenId)}</BaseM>}
          <Spacer height={16} />
          <StyledLinkContainer>
            {openSeaExternalUrl && (
              <>
                <InteractiveLink href={openSeaExternalUrl}>View on OpenSea</InteractiveLink>
                {isFeatureEnabled(FeatureFlag.REFRESH_METADATA, query) && (
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
