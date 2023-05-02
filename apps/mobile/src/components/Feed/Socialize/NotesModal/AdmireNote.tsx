import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { AdmireNoteFragment$key } from '~/generated/AdmireNoteFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { AdmireIcon } from '../AdmireIcon';

type Props = {
  admireRef: AdmireNoteFragment$key;
  style?: ViewProps['style'];
};

export function AdmireNote({ admireRef, style }: Props) {
  const admire = useFragment(
    graphql`
      fragment AdmireNoteFragment on Admire {
        __typename

        creationTime
        admirer {
          username
        }
      }
    `,
    admireRef
  );

  return (
    <View className="flex flex-row justify-between items-center px-4" style={style}>
      <View className="flex flex-row items-center space-x-2">
        <AdmireIcon active />
        <Text>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            {admire.admirer?.username ?? null}
          </Typography>{' '}
          admired this
        </Text>
      </View>
      <Typography className="text-metal text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        {getTimeSince(admire.creationTime)}
      </Typography>
    </View>
  );
}
