import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { GalleryNameHeaderFragment$key } from '~/generated/GalleryNameHeaderFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type GalleryNameHeaderProps = {
  galleryRef: GalleryNameHeaderFragment$key;
  isOnGalleryScreen?: boolean;
};

export function GalleryNameHeader({ galleryRef, isOnGalleryScreen }: GalleryNameHeaderProps) {
  const gallery = useFragment(
    graphql`
      fragment GalleryNameHeaderFragment on Gallery {
        __typename
        dbid
        name
        owner {
          username
        }
      }
    `,
    galleryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleGalleryNamePress = useCallback(() => {
    navigation.navigate('Gallery', { galleryId: gallery.dbid });
  }, [gallery.dbid, navigation]);

  const handleUsernamePress = useCallback(() => {
    if (gallery.owner?.username) {
      navigation.navigate('Profile', { username: gallery?.owner?.username });
    }
  }, [gallery.owner?.username, navigation]);

  return (
    <View className="flex flex-row items-center">
      <GalleryTouchableOpacity
        onPress={handleUsernamePress}
        eventElementId="Gallery Header"
        eventName="Gallery Header Clicked"
        eventContext={contexts.UserGallery}
        properties={{ variant: 'username' }}
      >
        <Typography
          numberOfLines={1}
          className="text-metal text-lg"
          font={{ family: 'GTAlpina', weight: 'StandardLight' }}
        >
          {gallery?.owner?.username}
        </Typography>
      </GalleryTouchableOpacity>
      <Typography className="text-lg" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
        {' '}
        /{' '}
      </Typography>
      <GalleryTouchableOpacity
        disabled={isOnGalleryScreen}
        onPress={handleGalleryNamePress}
        eventElementId="Gallery Header"
        eventName="Gallery Header Clicked"
        eventContext={contexts.UserGallery}
        properties={{ variant: 'gallery title' }}
      >
        <Typography
          numberOfLines={1}
          className={clsx('text-lg', {
            'text-metal': !isOnGalleryScreen,
          })}
          font={{ family: 'GTAlpina', weight: 'StandardLight' }}
        >
          {gallery.name || 'Untitled'}
        </Typography>
      </GalleryTouchableOpacity>
    </View>
  );

  return null;
}
