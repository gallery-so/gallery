import { ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { LinkableAddressFragment$key } from '~/generated/LinkableAddressFragment.graphql';
import { getExternalAddressLink, graphqlTruncateAddress } from '~/shared/utils/wallet';

import { InteractiveLink, InteractiveLinkProps } from './InteractiveLink';
import { Typography } from './Typography';

type LinkableAddressProps = {
  chainAddressRef: LinkableAddressFragment$key;
  type: InteractiveLinkProps['type'];
  style?: ViewProps['style'];
};

export function LinkableAddress({ chainAddressRef, type, style }: LinkableAddressProps) {
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
      <Typography
        className="text-sm"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
        style={style}
      >
        {truncatedAddress || address.address}
      </Typography>
    );
  } else if (truncatedAddress) {
    return (
      <RawLinkableAddress
        type={type}
        link={link}
        truncatedAddress={truncatedAddress}
        address={address.address}
        style={style}
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
  type: InteractiveLinkProps['type'];
  style?: ViewProps['style'];
};

export function RawLinkableAddress({
  link,
  truncatedAddress,
  address,
  type,
  style,
}: RawLinkableAddressProps) {
  return (
    <InteractiveLink href={link} type={type} showUnderline style={style}>
      {truncatedAddress || address}
    </InteractiveLink>
  );
}
