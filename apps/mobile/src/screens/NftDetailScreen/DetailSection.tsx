import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

import { InteractiveLink } from '~/components/InteractiveLink';

import { Typography } from '../../components/Typography';
import { ExternalLinkIcon } from '../../icons/ExternalLinkIcon';
import colors from '~/shared/theme/colors';

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
      className="text-xs text-[#707070] dark:color-metal"
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
  trackingLabel: string;
  showExternalLinkIcon?: boolean;
};
export function DetailExternalLink({
  link,
  label,
  trackingLabel,
  showExternalLinkIcon = false,
}: DetailExternalLinkProps) {
  return (
    <InteractiveLink href={link} type={trackingLabel}>
      <View className="flex flex-row">
        <Typography
          numberOfLines={1}
          ellipsizeMode="middle"
          className="text-sm"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {label}
        </Typography>
        {showExternalLinkIcon && (
          <View className="flex align-center justify-center">
            <ExternalLinkIcon />
          </View>
        )}
      </View>
    </InteractiveLink>
  );
}

export function DetailMoreInfoLink({ link }: { link: string }) {
  return (
    <InteractiveLink href={link} type="NFT Detail More Info URL">
      <Typography
        numberOfLines={1}
        ellipsizeMode="middle"
        className="text-sm"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        More Info
      </Typography>
    </InteractiveLink>
  );
}
