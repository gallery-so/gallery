import { Suspense } from 'react';
import useSWR from 'swr';
import { PlainErrorBoundary } from './PlainErrorBoundary';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CopyableAddress, RawCopyableAddress } from 'components/CopyableAddress';
import { EnsOrAddressFragment$key } from '../../__generated__/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '../../__generated__/EnsOrAddressWithSuspenseFragment.graphql';

type EnsNameProps = {
  chainAddressRef: EnsOrAddressFragment$key;
};

const EnsName = ({ chainAddressRef }: EnsNameProps) => {
  const address = useFragment(
    graphql`
      fragment EnsOrAddressFragment on ChainAddress {
        address @required(action: THROW)

        ...CopyableAddressFragment
      }
    `,
    chainAddressRef
  );

  const { data } = useSWR(
    chainAddressRef
      ? `https://api.ensideas.com/ens/resolve/${encodeURIComponent(address.address.toLowerCase())}`
      : null
  );

  if (data?.name) {
    return <RawCopyableAddress address={data.address} truncatedAddress={data.name} />;
  }

  // If we couldn't resolve, let's fallback to the default component
  return <CopyableAddress chainAddressRef={address} />;
};

type EnsOrAddressProps = {
  chainAddressRef: EnsOrAddressWithSuspenseFragment$key;
};

export const EnsOrAddress = ({ chainAddressRef }: EnsOrAddressProps) => {
  const address = useFragment(
    graphql`
      fragment EnsOrAddressWithSuspenseFragment on ChainAddress {
        address

        ...EnsOrAddressFragment
        ...CopyableAddressFragment
      }
    `,
    chainAddressRef
  );

  return (
    <Suspense fallback={<CopyableAddress chainAddressRef={address} />}>
      <PlainErrorBoundary fallback={<CopyableAddress chainAddressRef={address} />}>
        <EnsName chainAddressRef={address} />
      </PlainErrorBoundary>
    </Suspense>
  );
};
