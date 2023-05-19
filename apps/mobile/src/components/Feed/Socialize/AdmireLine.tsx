import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { AdmireLineEventFragment$key } from '~/generated/AdmireLineEventFragment.graphql';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { AdmireLineQueryFragment$key } from '~/generated/AdmireLineQueryFragment.graphql';

import { useNotesModal } from './NotesModal/useNotesModal';

type Props = {
  totalAdmires: number;
  admireRef: AdmireLineFragment$key;
  eventRef: AdmireLineEventFragment$key;
  queryRef: AdmireLineQueryFragment$key;
};

export function AdmireLine({ admireRef, eventRef, queryRef, totalAdmires }: Props) {
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
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...NotesModalQueryFragment
      }
    `,
    queryRef
  );

  const event = useFragment(
    graphql`
      fragment AdmireLineEventFragment on FeedEvent {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...NotesModalFragment
      }
    `,
    eventRef
  );

  const { handleOpen, notesModal } = useNotesModal(event, query);

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
      <View className="flex flex-row">
        {admire.admirer && (
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {admirerName}{' '}
          </Typography>
        )}
        {totalAdmires === 1 ? (
          <Text className="text-xs dark:text-white">admired this</Text>
        ) : (
          <View className="flex flex-row">
            <Text className="text-xs dark:text-white">and </Text>

            <GalleryTouchableOpacity
              onPress={handleOpen}
              eventElementId="Expand Admirers Button"
              eventName="Expand Admirers Button Clicked"
            >
              <Typography
                className="text-xs underline"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {totalAdmires - 1} {totalAdmires === 2 ? 'other' : 'others'}
              </Typography>
            </GalleryTouchableOpacity>

            <Text className="text-xs dark:text-white"> admired this</Text>
          </View>
        )}
      </View>
      {notesModal}
    </View>
  );
}
