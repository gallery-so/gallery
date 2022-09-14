import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftAdditionalDetailsFragment$key } from '../../../../__generated__/NftAdditionalDetailsFragment.graphql';
import { NftAdditionalDetailsPOAP } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetailsPOAP';
import { NftAdditionalDetailsNonPOAP } from 'scenes/NftDetailPage/NftAdditionalDetails/NftAdditionalDetailsNonPOAP';

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
        ...NftAdditionalDetailsNonPOAPFragment
      }
    `,
    tokenRef
  );

  if (token.chain === 'POAP') {
    return <NftAdditionalDetailsPOAP showDetails={showDetails} tokenRef={token} />;
  }

  return <NftAdditionalDetailsNonPOAP showDetails={showDetails} tokenRef={token} />;
}
