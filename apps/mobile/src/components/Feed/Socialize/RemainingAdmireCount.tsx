import { TouchableOpacity } from 'react-native';

import { Typography } from '~/components/Typography';

type Props = {
  remainingCount: number;
};

export function RemainingAdmireCount({ remainingCount }: Props) {
  return (
    <TouchableOpacity onPress={() => {}}>
      <Typography className="text-xs underline" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        + {remainingCount} others
      </Typography>
    </TouchableOpacity>
  );
}
