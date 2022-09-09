import { FeatureFlag } from 'components/core/enums';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useRefreshToken } from 'hooks/api/tokens/useRefreshToken';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { NftAdditionalDetailsNonPOAPFragment$key } from '../../../../__generated__/NftAdditionalDetailsNonPOAPFragment.graphql';
import { NftAdditionalDetailsNonPOAPQuery } from '../../../../__generated__/NftAdditionalDetailsNonPOAPQuery.graphql';
import { getOpenseaExternalUrl, hexHandler } from 'utils/getOpenseaExternalUrl';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  tokenRef: NftAdditionalDetailsNonPOAPFragment$key;
};

export function NftAdditionalDetailsNonPOAP({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsNonPOAPFragment on Token {
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
  const query = useLazyLoadQuery<NftAdditionalDetailsNonPOAPQuery>(
    graphql`
      query NftAdditionalDetailsNonPOAPQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [refreshToken, isRefreshing] = useRefreshToken();

  const { dbid, tokenId, contract, externalUrl } = token;

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
    <VStack gap={16}>
      {contract?.contractAddress?.address && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <InteractiveLink
            href={`https://etherscan.io/address/${contract.contractAddress.address}`}
          >
            {contract.contractAddress.address}
          </InteractiveLink>
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
        </div>
      )}

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
    </VStack>
  );
}

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
