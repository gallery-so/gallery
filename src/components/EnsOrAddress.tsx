import { Suspense } from 'react';
import useSWR from 'swr';
import { PlainErrorBoundary } from './PlainErrorBoundary';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { LinkableAddress, RawLinkableAddress } from 'components/LinkableAddress';
import { EnsOrAddressFragment$key } from '../../__generated__/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '../../__generated__/EnsOrAddressWithSuspenseFragment.graphql';
import { getExternalAddressLink } from 'utils/wallet';

type EnsNameProps = {
  chainAddressRef: EnsOrAddressFragment$key;
};

const EnsName = ({ chainAddressRef }: EnsNameProps) => {
  const address = useFragment(
    graphql`
      fragment EnsOrAddressFragment on ChainAddress {
        address @required(action: THROW)

        ...LinkableAddressFragment
        ...walletGetExternalAddressLinkFragment
      }
    `,
    chainAddressRef
  );

  const { data } = useSWR(
    chainAddressRef
      ? `https://api.ensideas.com/ens/resolve/${encodeURIComponent(address.address.toLowerCase())}`
      : null
  );

  const link = getExternalAddressLink(address);

  if (data?.name && link) {
    return <RawLinkableAddress link={link} address={data.address} truncatedAddress={data.name} />;
  }

  // If we couldn't resolve, let's fallback to the default component
  return <LinkableAddress chainAddressRef={address} />;
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
        ...LinkableAddressFragment
      }
    `,
    chainAddressRef
  );

  return (
    <Suspense fallback={<LinkableAddress chainAddressRef={address} />}>
      <PlainErrorBoundary fallback={<LinkableAddress chainAddressRef={address} />}>
        <EnsName chainAddressRef={address} />
      </PlainErrorBoundary>
    </Suspense>
  );
};