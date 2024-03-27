import { ViewProps } from 'react-native';

import { Typography } from './Typography';

type Weight = 'Regular' | 'Bold';

export const TitleXS = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      className="text-metal text-xs leading-4 uppercase"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
};

export const TitleL = ({
  children,
  classNameOverride,
}: {
  children: React.ReactNode;
  classNameOverride: string;
}) => {
  return (
    <Typography
      className={`text-black-900 dark:text-white text-lg leading-6 ${classNameOverride}`}
      font={{ family: 'ABCDiatype', weight: 'Bold' }}
    >
      {children}
    </Typography>
  );
};

export const BaseM = ({
  children,
  weight = 'Regular',
  classNameOverride,
  style,
}: {
  children: React.ReactNode;
  weight?: Weight;
  classNameOverride?: string;
  style?: ViewProps['style'];
}) => {
  return (
    <Typography
      className={`text-black-900 dark:text-white text-sm leading-5 ${classNameOverride}`}
      font={{ family: 'ABCDiatype', weight }}
      style={style}
    >
      {children}
    </Typography>
  );
};

export const BaseS = ({
  children,
  classNameOverride,
}: {
  children: React.ReactNode;
  classNameOverride?: string;
}) => {
  return (
    <Typography
      className={`text-black-900 dark:text-white text-xs leading-4 ${classNameOverride}`}
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
};
