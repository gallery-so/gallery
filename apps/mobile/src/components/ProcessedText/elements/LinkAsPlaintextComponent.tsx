import { Typography } from '~/components/Typography';

type LinkAsPlaintextComponentProps = {
  url: string;
  value?: string;
};

export function LinkAsPlaintextComponent({ url, value }: LinkAsPlaintextComponentProps) {
  return (
    <>
      <Typography
        className="text-sm"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
        style={{ fontSize: 14, lineHeight: 18, paddingVertical: 2 }}
      >
        {value ?? url}
      </Typography>
    </>
  );
}
