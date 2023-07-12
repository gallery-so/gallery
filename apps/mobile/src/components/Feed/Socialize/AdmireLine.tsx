import { useNavigation } from '@react-navigation/native';
import { View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { AdmireLineFragment$key } from '~/generated/AdmireLineFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type AdmireLineProps = {
  style?: ViewProps['style'];
  userRefs: AdmireLineFragment$key;

  onMultiUserPress: () => void;
};

export function AdmireLine({ userRefs, onMultiUserPress, style }: AdmireLineProps) {
  const users = useFragment(
    graphql`
      fragment AdmireLineFragment on GalleryUser @relay(plural: true) {
        __typename
        username
      }
    `,
    userRefs
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const [firstUser] = users;
  if (users.length === 1 && firstUser) {
    function handleUserPress() {
      if (firstUser?.username) {
        navigation.push('Profile', { username: firstUser.username, hideBackButton: false });
      }
    }

    return (
      <View style={style} className="flex flex-row items-center">
        <GalleryTouchableOpacity
          style={style}
          onPress={handleUserPress}
          eventElementId={'AdmireLine Single User'}
          eventName={'AdmireLine Single User'}
        >
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {firstUser.username}{' '}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          admired this
        </Typography>
      </View>
    );
  } else if (users.length > 1) {
    return (
      <View style={style} className="flex flex-row items-center">
        <GalleryTouchableOpacity
          onPress={onMultiUserPress}
          eventElementId={'AdmireLine Single User'}
          eventName={'AdmireLine Single User'}
        >
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {users.length} collectors{' '}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          admired this
        </Typography>
      </View>
    );
  }

  return null;
}
