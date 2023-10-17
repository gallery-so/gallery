import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

import { GalleryLink } from '~/components/GalleryLink';
import { contexts } from '~/shared/analytics/constants';

import { Typography, TypographyProps } from '../../components/Typography';
import { ExternalLinkIcon } from '../../icons/ExternalLinkIcon';

export function DetailSection({
  children,
  style,
}: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View style={style} className="flex flex-1 flex-col items-start">
      {children}
    </View>
  );
}

export function DetailLabelText({ children }: PropsWithChildren) {
  return (
    <Typography
      className="text-xs text-shadow dark:color-metal"
      font={{ family: 'ABCDiatype', weight: 'Medium' }}
    >
      {children}
    </Typography>
  );
}

export function DetailValue({ children }: PropsWithChildren) {
  return (
    <Typography
      numberOfLines={1}
      ellipsizeMode="middle"
      className="text-sm"
      font={{ family: 'ABCDiatype', weight: 'Bold' }}
    >
      {children}
    </Typography>
  );
}

type DetailExternalLinkProps = {
  link: string;
  label: string;
  font?: TypographyProps['font'];
  showExternalLinkIcon?: boolean;
};

export function DetailExternalLink({
  link,
  label,
  font,
  showExternalLinkIcon = false,
}: DetailExternalLinkProps) {
  return (
    <GalleryLink
      href={link}
      eventElementId="Project External Link"
      eventName="Project External Link Press"
      eventContext={contexts['NFT Detail']}
      properties={{ platform: label }}
    >
      <View className="flex flex-row">
        <Typography
          numberOfLines={1}
          ellipsizeMode="middle"
          className="text-sm"
          font={font ?? { family: 'ABCDiatype', weight: 'Regular' }}
        >
          {label}
        </Typography>
        {showExternalLinkIcon && (
          <View className="flex align-center justify-center">
            <ExternalLinkIcon />
          </View>
        )}
      </View>
    </GalleryLink>
  );
}
