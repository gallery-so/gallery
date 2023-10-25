import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useSWR from 'swr';

import { EnsOrAddressFragment$key } from '~/generated/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '~/generated/EnsOrAddressWithSuspenseFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getExternalAddressLink } from '~/shared/utils/wallet';

import { LinkableAddress, RawLinkableAddress } from './LinkableAddress';
import { Typography } from './Typography';

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
        eventElementId="ENS Name"
        eventName="ENS Name Press"
        eventContext={eventContext}
      />
    );
  }

  // If we couldn't resolve, let's fallback to the default component
  return (
    <LinkableAddress
      chainAddressRef={address}
      eventElementId="Wallet Address ENS Name Fallback"
      eventName="Wallet Address ENS Name Fallback Press"
      eventContext={eventContext}
    />
  );
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
    <Suspense
      fallback={
        <LinkableAddress
          chainAddressRef={address}
          eventElementId="Wallet Address ENS Name Fallback"
          eventName="Wallet Address ENS Name Fallback Press"
          eventContext={eventContext}
        />
      }
    >
      <ReportingErrorBoundary
        fallback={
          <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>Not Found</Typography>
        }
      >
        <EnsName chainAddressRef={address} eventContext={eventContext} />
      </ReportingErrorBoundary>
    </Suspense>
  );
};
