import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { GalleryNameHeaderFragment$key } from '~/generated/GalleryNameHeaderFragment.graphql';

type GalleryNameHeaderProps = {
  galleryRef: GalleryNameHeaderFragment$key;
};

export function GalleryNameHeader({ galleryRef }: GalleryNameHeaderProps) {
  const gallery = useFragment(
    graphql`
      fragment GalleryNameHeaderFragment on Gallery {
        __typename
        name
        owner {
          username
        }
      }
    `,
    galleryRef
  );

  return (
    <Text numberOfLines={1}>
      <Typography
        className="text-metal text-lg"
        font={{ family: 'GTAlpina', weight: 'StandardLight' }}
      >
        {gallery?.owner?.username}
      </Typography>
      <Typography className="text-lg" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
        {' '}
        /{' '}
      </Typography>
      <Typography className="text-lg" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
        {gallery.name || 'Untitled'}
      </Typography>
    </Text>
  );

  return null;
}
