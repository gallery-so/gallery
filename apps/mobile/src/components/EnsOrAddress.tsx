import { useColorScheme } from 'nativewind';
import { Suspense, useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { EnsOrAddressFragment$key } from '~/generated/EnsOrAddressFragment.graphql';
import { EnsOrAddressWithSuspenseFragment$key } from '~/generated/EnsOrAddressWithSuspenseFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import colors from '~/shared/theme/colors';
import { getExternalAddressLink } from '~/shared/utils/wallet';

import { LinkableAddress, RawLinkableAddress } from './LinkableAddress';

type EnsNameProps = {
  chainAddressRef: EnsOrAddressFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

type Address = {
  address: string;
  name: string;
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

  const [addressData, setAddressData] = useState<Address | null>(null);
  const { colorScheme } = useColorScheme();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (chainAddressRef) {
        try {
          const response = await fetch(
            `https://api.ensideas.com/ens/resolve/${encodeURIComponent(
              address.address.toLowerCase()
            )}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const responseData = await response.json();
          setAddressData(responseData);
        } catch (error) {
          setError(error as Error);
        }
      }
    };

    fetchData();
  }, [chainAddressRef, address.address]);

  const link = getExternalAddressLink(address);

  if (addressData?.name && link && !error) {
    return (
      <RawLinkableAddress
        link={link}
        address={addressData?.address}
        truncatedAddress={addressData?.name}
        textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
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
      textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
      font={{ family: 'ABCDiatype', weight: 'Bold' }}
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

  const { colorScheme } = useColorScheme();

  return (
    <Suspense
      fallback={
        <LinkableAddress
          chainAddressRef={address}
          textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          eventElementId="Wallet Address ENS Name Fallback"
          eventName="Wallet Address ENS Name Fallback Press"
          eventContext={eventContext}
        />
      }
    >
      <ReportingErrorBoundary
        fallback={
          <LinkableAddress
            chainAddressRef={address}
            textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            eventElementId="Wallet Address ENS Name Fallback"
            eventName="Wallet Address ENS Name Fallback Press"
            eventContext={eventContext}
          />
        }
      >
        <EnsName chainAddressRef={address} eventContext={eventContext} />
      </ReportingErrorBoundary>
    </Suspense>
  );
};
