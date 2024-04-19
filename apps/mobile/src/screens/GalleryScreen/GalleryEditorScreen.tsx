import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { Text } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { GalleryEditorActions } from '~/components/GalleryEditor/GalleryEditorActions';
import { GalleryEditorRender } from '~/components/GalleryEditor/GalleryEditorRender';
import GalleryEditorProvider from '~/contexts/GalleryEditor/GalleryEditorContext';
import { GalleryEditorScreenQuery } from '~/generated/GalleryEditorScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

function InnerGalleryEditorScreen() {
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'GalleryEditor'>>();

  const query = useLazyLoadQuery<GalleryEditorScreenQuery>(
    graphql`
      query GalleryEditorScreenQuery($galleryId: DBID!) {
        viewer {
          ... on Viewer {
            __typename
          }
        }
        galleryById(id: $galleryId) {
          __typename
          ...GalleryEditorRenderFragment
        }
        ...GalleryEditorContextFragment
        ...GalleryEditorRenderQueryFragment
      }
    `,
    { galleryId: route.params.galleryId }
  );

  const gallery = query.galleryById;

  if (!gallery) {
    throw new Error('GalleryEditor rendered without a Gallery');
  }

  return (
    <GalleryEditorProvider queryRef={query}>
      <GalleryEditorRender galleryRef={gallery} queryRef={query} />
      <GalleryEditorActions />
    </GalleryEditorProvider>
  );
}

export function GalleryEditorScreen() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <InnerGalleryEditorScreen />
    </Suspense>
  );
}
