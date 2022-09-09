import { useFragment } from 'react-relay';
import { NftAdditionalDetailsPOAPFragment$key } from '../../../../__generated__/NftAdditionalDetailsPOAPFragment.graphql';
import { graphql } from 'relay-runtime';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { VStack } from 'components/core/Spacer/Stack';

type NftAdditionalDetailsPOAPProps = {
  tokenRef: NftAdditionalDetailsPOAPFragment$key;
};

export function NftAdditionalDetailsPOAP({ tokenRef }: NftAdditionalDetailsPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsPOAPFragment on Token {
        id
        tokenMetadata
      }
    `,
    tokenRef
  );

  const { event_id: id, chain, supply } = JSON.parse(token.tokenMetadata ?? '{}');

  return (
    <VStack gap={16}>
      {id && (
        <div>
          <TitleXS>POAP ID</TitleXS>
          <BaseM>{id}</BaseM>
        </div>
      )}
      {supply && (
        <div>
          <TitleXS>SUPPLY</TitleXS>
          <BaseM>{supply}</BaseM>
        </div>
      )}
      {chain && (
        <div>
          <TitleXS>CHAIN</TitleXS>
          <BaseM>{chain}</BaseM>
        </div>
      )}
    </VStack>
  );
}
