import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CopyableAddressFragment$key } from '__generated__/CopyableAddressFragment.graphql';
import { StyledAnchor } from 'components/core/InteractiveLink/InteractiveLink';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { graphqlTruncateAddress } from 'utils/wallet';

type CopyableAddressProps = {
  chainAddressRef: CopyableAddressFragment$key;
};

export function CopyableAddress({ chainAddressRef }: CopyableAddressProps) {
  const address = useFragment(
    graphql`
      fragment CopyableAddressFragment on ChainAddress {
        chain @required(action: THROW)
        address @required(action: THROW)

        ...walletTruncateAddressFragment
      }
    `,
    chainAddressRef
  );

  const truncatedAddress = graphqlTruncateAddress(address);

  return <RawCopyableAddress address={address.address} truncatedAddress={truncatedAddress} />;
}

type RawCopyableAddressProps = {
  address: string;
  truncatedAddress: string | null;
};

export function RawCopyableAddress({ address, truncatedAddress }: RawCopyableAddressProps) {
  return (
    <CopyToClipboard textToCopy={address} successText="Address copied to clipboard.">
      <StyledAnchor>{truncatedAddress || address}</StyledAnchor>
    </CopyToClipboard>
  );
}
