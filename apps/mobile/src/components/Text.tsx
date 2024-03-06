import { Typography } from './Typography';

export const TitleXS = ({ children }: { children: string }) => {
  return (
    <Typography
      className="text-metal text-xs leading-4 uppercase"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
};

export const TitleS = ({ children }: { children: string }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-base leading-5"
      font={{ family: 'ABCDiatype', weight: 'Bold' }}
    >
      {children}
    </Typography>
  );
};

export const TitleLItalic = ({ children }: { children: string }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-2xl leading-7 tracking-tighter"
      font={{ family: 'GTAlpina', weight: 'StandardLight', italic: true }}
    >
      {children}
    </Typography>
  );
};

export const BaseM = ({ children }: { children: string }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-sm leading-5"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
};

export const BaseS = ({ children }: { children: string }) => {
  return (
    <Typography
      className="text-black-900 dark:text-white text-xs leading-4"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
};
