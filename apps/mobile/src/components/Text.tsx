import { Typography } from './Typography';

type Weight = 'Regular' | 'Bold';

export const TitleLItalic = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-2xl leading-7 tracking-tighter"
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

export const BaseM = ({
  children,
  weight = 'Regular',
}: {
  children: React.ReactNode;
  weight?: Weight;
}) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-sm leading-5"
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
