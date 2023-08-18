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
  totalAdmires: number;

  onAdmirePress: () => void;
  onMultiUserPress: () => void;
};

export function AdmireLine({
  userRefs,
  totalAdmires,
  onAdmirePress,
  onMultiUserPress,
  style,
}: AdmireLineProps) {
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
  if (totalAdmires === 1 && firstUser) {
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
  } else if (totalAdmires > 1) {
    return (
      <View style={style} className="flex flex-row items-center">
        <GalleryTouchableOpacity
          onPress={onMultiUserPress}
          eventElementId={'AdmireLine Single User'}
          eventName={'AdmireLine Single User'}
        >
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {totalAdmires} collectors{' '}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          admired this
        </Typography>
      </View>
    );
  }

  return (
    <View style={style} className="flex flex-row items-center ">
      <GalleryTouchableOpacity
        onPress={onAdmirePress}
        eventElementId={'AdmireLine First Admire CTA'}
        eventName={'Tapped AdmireLine First Admire CTA'}
        className="flex  justify-center h-6"
      >
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Be the first to admire this
        </Typography>
      </GalleryTouchableOpacity>
    </View>
  );
}
