import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CopyableAddressFragment$key } from '__generated__/CopyableAddressFragment.graphql';
import { StyledAnchor } from 'components/core/InteractiveLink/InteractiveLink';
import { useMemo } from 'react';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';

type CopyableAddressProps = {
  chainAddressRef: CopyableAddressFragment$key;
};

export function CopyableAddress({ chainAddressRef }: CopyableAddressProps) {
  const { chain, address } = useFragment(
    graphql`
      fragment CopyableAddressFragment on ChainAddress {
        chain @required(action: THROW)
        address @required(action: THROW)
      }
    `,
    chainAddressRef
  );

  /**
   * TODO: We should consolidate this with truncateAddress at some point
   */
  const truncatedAddress = useMemo(() => {
    if (chain === 'Tezos') {
      return `${address.slice(0, 6)}....${address.slice(-6)}`;
    } else {
      return `${address.slice(0, 8)}...${address.slice(-4)}`;
    }
  }, [address, chain]);

  return <RawCopyableAddress address={address} truncatedAddress={truncatedAddress} />;
}

type RawCopyableAddressProps = {
  address: string;
  truncatedAddress: string;
};

export function RawCopyableAddress({ address, truncatedAddress }: RawCopyableAddressProps) {
  return (
    <CopyToClipboard textToCopy={address} successText="Address copied to clipboard.">
      <StyledAnchor>{truncatedAddress}</StyledAnchor>
    </CopyToClipboard>
  );
}
