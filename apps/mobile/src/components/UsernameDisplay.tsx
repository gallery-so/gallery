import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UsernameDisplayFragment$key } from '~/generated/UsernameDisplayFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

type Props = {
  userRef: UsernameDisplayFragment$key;
  style?: GalleryTouchableOpacityProps['style'];
  size?: 'xs' | 'sm';
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function UsernameDisplay({ userRef, style, size = 'xs', eventContext }: Props) {
  const user = useFragment(
    graphql`
      fragment UsernameDisplayFragment on GalleryUser {
        username
      }
    `,
    userRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handlePress = useCallback(() => {
    if (user.username) {
      navigation.push('Profile', { username: user.username, hideBackButton: false });
    }
  }, [navigation, user.username]);

  return (
    <GalleryTouchableOpacity
      withoutFeedback
      onPress={handlePress}
      style={style}
      eventElementId="Username Interaction"
      eventName="Username Interaction Clicked"
      eventContext={eventContext}
    >
      <Typography className={`text-${size}`} font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        {user.username}
      </Typography>
    </GalleryTouchableOpacity>
  );
}
