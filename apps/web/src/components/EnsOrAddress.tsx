import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useSWR from 'swr';

import { LinkableAddress, RawLinkableAddress } from '~/components/LinkableAddress';
import { EnsOrAddressFragment$key } from '~/generated/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '~/generated/EnsOrAddressWithSuspenseFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getExternalAddressLink } from '~/shared/utils/wallet';

type EnsNameProps = {
  chainAddressRef: EnsOrAddressFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

const EnsName = ({ chainAddressRef, eventContext }: EnsNameProps) => {
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
        eventContext={eventContext}
      />
    );
  }

  // If we couldn't resolve, let's fallback to the default component
  return <LinkableAddress chainAddressRef={address} eventContext={eventContext} />;
};

type EnsOrAddressProps = {
  chainAddressRef: EnsOrAddressWithSuspenseFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export const EnsOrAddress = ({ chainAddressRef, eventContext }: EnsOrAddressProps) => {
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
    <Suspense fallback={<LinkableAddress chainAddressRef={address} eventContext={eventContext} />}>
      <ReportingErrorBoundary
        fallback={<LinkableAddress chainAddressRef={address} eventContext={eventContext} />}
      >
        <EnsName chainAddressRef={address} />
      </ReportingErrorBoundary>
    </Suspense>
  );
};
