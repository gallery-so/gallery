import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { LinkableAddressFragment$key } from '~/generated/LinkableAddressFragment.graphql';
import { getExternalAddressLink, graphqlTruncateAddress } from '~/shared/utils/wallet';

import { InteractiveLink } from './InteractiveLink';
import { Typography } from './Typography';

type LinkableAddressProps = {
  chainAddressRef: LinkableAddressFragment$key;
};

export function LinkableAddress({ chainAddressRef }: LinkableAddressProps) {
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
    return (
      <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        {truncatedAddress || address.address}
      </Typography>
    );
  } else if (truncatedAddress) {
    return (
      <RawLinkableAddress
        link={link}
        truncatedAddress={truncatedAddress}
        address={address.address}
      />
    );
  } else {
    throw new Error('Missing link & truncated address');
  }
}

type RawLinkableAddressProps = {
  link: string;
  address: string;
  truncatedAddress: string | null;
};

export function RawLinkableAddress({ link, truncatedAddress, address }: RawLinkableAddressProps) {
  return <InteractiveLink href={link}>{truncatedAddress || address}</InteractiveLink>;
}
