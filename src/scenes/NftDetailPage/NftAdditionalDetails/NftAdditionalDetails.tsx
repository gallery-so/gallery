import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftAdditionalDetailsFragment$key } from '../../../../__generated__/NftAdditionalDetailsFragment.graphql';
import { NftAdditionalDetailsPOAP } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetailsPOAP';
import { NftAdditionalDetailsEth } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetailsEth';
import { NftAdditionalDetailsTezos } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetailsTezos';

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

  if (token.chain === 'POAP') {
    return <NftAdditionalDetailsPOAP showDetails={showDetails} tokenRef={token} />;
  } else if (token.chain === 'Tezos') {
    return <NftAdditionalDetailsTezos showDetails={showDetails} tokenRef={token} />;
  }

  return <NftAdditionalDetailsEth showDetails={showDetails} tokenRef={token} />;
}
