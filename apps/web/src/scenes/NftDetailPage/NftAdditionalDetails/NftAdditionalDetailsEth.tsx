import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { LinkableAddress } from '~/components/LinkableAddress';
import { NftAdditionalDetailsEthFragment$key } from '~/generated/NftAdditionalDetailsEthFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { hexToDec } from '~/shared/utils/hexToDec';

import NftDetailsExternalLinksEth from './NftDetailsExternalLinksEth';

type NftAdditionaDetailsNonPOAPProps = {
  tokenRef: NftAdditionalDetailsEthFragment$key;
};

export function NftAdditionalDetailsEth({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsEthFragment on Token {
        definition {
          tokenId
          contract {
            contractAddress {
              address
              ...LinkableAddressFragment
            }
          }
        }

        ...NftDetailsExternalLinksEthFragment
      }
    `,
    tokenRef
  );

  const { tokenId, contract } = token.definition;

  return (
    <VStack gap={16}>
      {contract?.contractAddress?.address && (
        <div>
          <TitleXS>Contract address</TitleXS>
          <LinkableAddress
            chainAddressRef={contract.contractAddress}
            eventContext={contexts['NFT Detail']}
          />
        </div>
      )}

      {tokenId && (
        <div>
          <TitleXS>Token ID</TitleXS>
          <BaseM>{hexToDec(tokenId)}</BaseM>
        </div>
      )}
      <NftDetailsExternalLinksEth tokenRef={token} />
    </VStack>
  );
}
