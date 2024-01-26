import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityGalleriesRowFragment$key } from '~/generated/CommunityGalleriesRowFragment.graphql';

import { CommunityGalleriesItem } from './CommunityGalleriesItem';

type Props = {
  galleryRefs: CommunityGalleriesRowFragment$key;
};

export function CommunityGalleriesRow({ galleryRefs }: Props) {
  const galleries = useFragment(
    graphql`
      fragment CommunityGalleriesRowFragment on CommunityGallery @relay(plural: true) {
        __typename
        gallery {
          dbid
        }
        ...CommunityGalleriesItemFragment
      }
    `,
    galleryRefs
  );

  return (
    <View className="flex-row px-4 space-x-1 mb-4">
      {galleries.map((gallery) => (
        <CommunityGalleriesItem key={gallery.gallery?.dbid} communityGalleryRef={gallery} />
      ))}
    </View>
  );
}
