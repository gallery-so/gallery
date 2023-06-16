import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useSWR from 'swr';

import { EnsOrAddressFragment$key } from '~/generated/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '~/generated/EnsOrAddressWithSuspenseFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getExternalAddressLink } from '~/shared/utils/wallet';

import { LinkableAddress, RawLinkableAddress } from './LinkableAddress';
import { Typography } from './Typography';

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
    return (
      <RawLinkableAddress
        link={link}
        address={data.address}
        truncatedAddress={data.name}
        type="ENS Name"
      />
    );
  }

  // If we couldn't resolve, let's fallback to the default component
  return <LinkableAddress chainAddressRef={address} type="ENS Name Fallback" />;
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
    <Suspense fallback={<LinkableAddress chainAddressRef={address} type="ENS Name Fallback" />}>
      <ReportingErrorBoundary
        fallback={
          <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not Found</Typography>
        }
      >
        <EnsName chainAddressRef={address} />
      </ReportingErrorBoundary>
    </Suspense>
  );
};
