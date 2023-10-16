import { TextProps, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { LinkableAddressFragment$key } from '~/generated/LinkableAddressFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { getExternalAddressLink, graphqlTruncateAddress } from '~/shared/utils/wallet';

import { GalleryLink } from './GalleryLink';
import { Typography, TypographyProps } from './Typography';

type LinkableAddressProps = {
  chainAddressRef: LinkableAddressFragment$key;
  style?: ViewProps['style'];
  textStyle?: TextProps['style'];
  font?: TypographyProps['font'];
} & GalleryElementTrackingProps;

export function LinkableAddress({
  chainAddressRef,
  style,
  textStyle,
  font,
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
}: LinkableAddressProps) {
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
        font={font ?? { family: 'ABCDiatype', weight: 'Regular' }}
        style={style}
      >
        {truncatedAddress || address.address}
      </Typography>
    );
  } else if (truncatedAddress) {
    return (
      <RawLinkableAddress
        link={link}
        truncatedAddress={truncatedAddress}
        address={address.address}
        style={style}
        textStyle={textStyle}
        font={font}
        eventElementId={eventElementId}
        eventName={eventName}
        eventContext={eventContext}
        eventFlow={eventFlow}
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
  style?: ViewProps['style'];
  textStyle?: TextProps['style'];
  font?: TypographyProps['font'];
} & GalleryElementTrackingProps;

export function RawLinkableAddress({
  link,
  truncatedAddress,
  address,
  style,
  textStyle,
  font,
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
}: RawLinkableAddressProps) {
  return (
    <GalleryLink
      href={link}
      style={style}
      textStyle={textStyle}
      font={font}
      eventElementId={eventElementId}
      eventName={eventName}
      eventContext={eventContext}
      eventFlow={eventFlow}
    >
      {truncatedAddress || address}
    </GalleryLink>
  );
}
