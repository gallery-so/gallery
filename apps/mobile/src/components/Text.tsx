import { Typography } from './Typography';

type Weight = 'Regular' | 'Bold';

export const TitleLItalic = ({
  children,
  classNameOverride,
}: {
  children: React.ReactNode;
  classNameOverride?: string;
}) => {
  return (
    <Typography
      className={`text-black-900 dark:text-white text-2xl leading-7 tracking-tighter ${classNameOverride}`}
      font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
    >
      {children}
    </Typography>
  );
};

export const TitleS = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-base leading-5"
      font={{ family: 'ABCDiatype', weight: 'Bold' }}
    >
      {children}
    </Typography>
  );
};

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
}: {
  children: React.ReactNode;
  weight?: Weight;
  classNameOverride?: string;
}) => {
  return (
    <Typography
      className={`text-black-900 dark:text-white text-sm leading-5 ${classNameOverride}`}
      font={{ family: 'ABCDiatype', weight }}
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
