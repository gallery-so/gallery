import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftAdditionalDetailsFragment$key } from '~/generated/NftAdditionalDetailsFragment.graphql';
import { NftAdditionalDetailsPOAP } from '~/screens/NftDetailScreen/NftAdditionalDetailsPOAP';

import { NftAdditionalDetailsEth } from './NftAdditionalDetailsEth';
import { NftAdditionalDetailsTezos } from './NftAdditionalDetailsTezos';

type NftAdditionalDetailsProps = {
  showDetails: boolean;
  tokenRef: NftAdditionalDetailsFragment$key;
};

export function NftAdditionalDetails({ tokenRef, showDetails }: NftAdditionalDetailsProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsFragment on Token {
        chain

        ...NftAdditionalDetailsPOAPFragment
        ...NftAdditionalDetailsTezosFragment
        ...NftAdditionalDetailsEthFragment
      }
    `,
    tokenRef
  );

  // if (token.chain === 'POAP') {
  //   return <NftAdditionalDetailsPOAP showDetails={showDetails} tokenRef={token} />;
  // } else if (token.chain === 'Tezos') {
  //   return <NftAdditionalDetailsTezos showDetails={showDetails} tokenRef={token} />;
  // }

  if (token.chain === 'POAP') {
    return <NftAdditionalDetailsPOAP showDetails={showDetails} tokenRef={token} />;
  } else if (token.chain === 'Tezos') {
    return <NftAdditionalDetailsTezos showDetails={showDetails} tokenRef={token} />;
  } else {
    return <NftAdditionalDetailsEth showDetails={showDetails} tokenRef={token} />;
  }
}
