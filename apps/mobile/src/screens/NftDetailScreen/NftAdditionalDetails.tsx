import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftAdditionalDetailsFragment$key } from '~/generated/NftAdditionalDetailsFragment.graphql';
import { NftAdditionalDetailsPOAP } from '~/screens/NftDetailScreen/NftAdditionalDetailsPOAP';

import { NftAdditionalDetailsEth } from './NftAdditionalDetailsEth';
import { NftAdditionalDetailsTezos } from './NftAdditionalDetailsTezos';

type NftAdditionalDetailsProps = {
  tokenRef: NftAdditionalDetailsFragment$key;
};

export function NftAdditionalDetails({ tokenRef }: NftAdditionalDetailsProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsFragment on Token {
        definition {
          chain
        }

        ...NftAdditionalDetailsPOAPFragment
        ...NftAdditionalDetailsTezosFragment
        ...NftAdditionalDetailsEthFragment
      }
    `,
    tokenRef
  );

  if (token.definition.chain === 'POAP') {
    return <NftAdditionalDetailsPOAP tokenRef={token} />;
  } else if (token.definition.chain === 'Tezos') {
    return <NftAdditionalDetailsTezos tokenRef={token} />;
  } else {
    return <NftAdditionalDetailsEth tokenRef={token} />;
  }
}
