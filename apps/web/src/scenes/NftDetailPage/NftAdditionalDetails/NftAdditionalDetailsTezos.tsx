import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { LinkableAddress } from '~/components/LinkableAddress';
import { ButtonPill } from '~/components/Pill';
import { TezosDomainOrAddress } from '~/components/TezosDomainOrAddress';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useRefreshMetadata } from '~/scenes/NftDetailPage/NftAdditionalDetails/useRefreshMetadata';
import { hexHandler } from '~/shared/utils/getOpenseaExternalUrl';
import { getFxHashExternalUrl, getObjktExternalUrl } from '~/shared/utils/getTezosExternalUrl';
import { DateFormatOption, formatDateString } from '~/utils/formatDateString';

type NftAdditionaDetailsNonPOAPProps = {
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsTezosFragment on Token {
        externalUrl
        tokenId
        lastUpdated
        contract {
          creatorAddress {
            address
            ...TezosDomainOrAddressWithSuspenseFragment
          }
          contractAddress {
            address
            ...LinkableAddressFragment
          }
        }

        ...useRefreshMetadataFragment
      }
    `,
    tokenRef
  );

  const [refresh, isRefreshing] = useRefreshMetadata(token);

  const { tokenId, contract, externalUrl, lastUpdated: lastUpdatedRaw } = token;

  const { fxhashUrl, objktUrl } = useMemo(() => {
    if (token.contract?.contractAddress?.address && token.tokenId) {
      const contractAddress = token.contract.contractAddress.address;
      const tokenId = hexHandler(token.tokenId);
      return {
        fxhashUrl: getFxHashExternalUrl(contractAddress, tokenId),
        objktUrl: getObjktExternalUrl(contractAddress, tokenId),
      };
    }

    return {
      fxhashUrl: null,
      objktUrl: null,
    };
  }, [token.contract?.contractAddress?.address, token.tokenId]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'right',
    });

  const lastUpdated = formatDateString(lastUpdatedRaw, DateFormatOption.ABBREVIATED);

  return (
    <VStack gap={16}>
      {token.contract?.creatorAddress?.address && (
        <div>
          <TitleXS>Creator</TitleXS>
          <TezosDomainOrAddress chainAddressRef={token.contract.creatorAddress} />
        </div>
      )}

      {contract?.contractAddress?.address && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <LinkableAddress chainAddressRef={contract.contractAddress} />
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexHandler(tokenId)}</BaseM>
        </div>
      )}

      <StyledLinkContainer>
        {fxhashUrl && <InteractiveLink href={fxhashUrl}>View on fx(hash)</InteractiveLink>}
        {objktUrl && <InteractiveLink href={objktUrl}>View on objkt</InteractiveLink>}
        {externalUrl && <InteractiveLink href={externalUrl}>More Info</InteractiveLink>}
      </StyledLinkContainer>
      <StartAlignedButtonPill
        onClick={refresh}
        disabled={isRefreshing}
        ref={reference}
        {...getReferenceProps()}
      >
        <HStack gap={6}>
          <IconContainer size="xs" variant="default" icon={<RefreshIcon />} />
          <TitleDiatypeM>Refresh metadata</TitleDiatypeM>
        </HStack>
        <NewTooltip
          {...getFloatingProps()}
          style={{ ...floatingStyle }}
          ref={floating}
          whiteSpace="pre-line"
          text={`Last refreshed ${lastUpdated}`}
        />
      </StartAlignedButtonPill>
    </VStack>
  );
}

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StartAlignedButtonPill = styled(ButtonPill)`
  align-self: start;
`;
