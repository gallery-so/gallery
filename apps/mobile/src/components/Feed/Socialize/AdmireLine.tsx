import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';

type Props = {
  admireRef: AdmireLineFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ admireRef, queryRef }: Props) {
  const admire = useFragment(
    graphql`
      fragment AdmireLineFragment on Admire {
        dbid

        admirer {
          dbid
          username
        }
      }
    `,
    admireRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireLineQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const admirerName = useMemo(() => {
    const isTheAdmirerTheLoggedInUser = query.viewer?.user?.dbid === admire.admirer?.dbid;

    if (isTheAdmirerTheLoggedInUser) {
      return 'You';
    } else if (admire.admirer?.username) {
      return admire.admirer.username;
    } else {
      return '<unknown>';
    }
  }, [admire.admirer?.dbid, admire.admirer?.username, query.viewer?.user?.dbid]);

  return (
    <View>
      <View className="flex flex-row gap-1">
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {admirerName}
        </Typography>
        <Text className="text-xs dark:text-white">admired this</Text>
      </View>
    </View>
  );
}
