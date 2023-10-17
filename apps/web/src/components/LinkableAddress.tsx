import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { BaseM } from '~/components/core/Text/Text';
import { LinkableAddressFragment$key } from '~/generated/LinkableAddressFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { getExternalAddressLink, graphqlTruncateAddress } from '~/shared/utils/wallet';

type LinkableAddressProps = {
  chainAddressRef: LinkableAddressFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function LinkableAddress({ chainAddressRef, eventContext }: LinkableAddressProps) {
  const address = useFragment(
    graphql`
      fragment LinkableAddressFragment on ChainAddress {
        address @required(action: THROW)

        ...walletTruncateAddressFragment
        ...walletGetExternalAddressLinkFragment
      }
    `,
    chainAddressRef
  );

  const link = getExternalAddressLink(address);
  const truncatedAddress = graphqlTruncateAddress(address);

  if (!link) {
    return <BaseM>{truncatedAddress || address.address}</BaseM>;
  }

  return (
    <RawLinkableAddress
      link={link}
      truncatedAddress={truncatedAddress}
      address={address.address}
      eventContext={eventContext}
    />
  );
}

type RawLinkableAddressProps = {
  link: string;
  address: string;
  truncatedAddress: string | null;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function RawLinkableAddress({
  link,
  truncatedAddress,
  address,
  eventContext,
}: RawLinkableAddressProps) {
  return (
    <GalleryLink
      eventElementId="Linkable Crypto Address"
      eventName="Click Linkable Crypto Address"
      eventContext={eventContext}
      href={link}
    >
      {truncatedAddress || address}
    </GalleryLink>
  );
}
