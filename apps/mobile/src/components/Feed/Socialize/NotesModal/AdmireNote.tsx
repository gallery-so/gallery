import { Text, View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { UsernameDisplay } from '~/components/UsernameDisplay';
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
        admirer @required(action: THROW) {
          ...UsernameDisplayFragment
        }
      }
    `,
    admireRef
  );

  return (
    <View className="flex flex-row justify-between items-center px-4" style={style}>
      <View className="flex flex-row items-center space-x-2">
        <AdmireIcon active height={20} />
        <View className="flex flex-row items-center">
          <UsernameDisplay userRef={admire.admirer} size="sm" />
          <Text className="dark:text-white"> admired this</Text>
        </View>
      </View>
      <Typography className="text-metal text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        {getTimeSince(admire.creationTime)}
      </Typography>
    </View>
  );
}
