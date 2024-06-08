import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { PublishGallery } from '~/components/Gallery/PublishGallery/PublishGallery';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import GalleryEditorProvider from '~/contexts/GalleryEditor/GalleryEditorContext';
import { PublishGalleryScreenQuery } from '~/generated/PublishGalleryScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

function InnerPublishGalleryScreen() {
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'PublishGallery'>>();

  const query = useLazyLoadQuery<PublishGalleryScreenQuery>(
    graphql`
      query PublishGalleryScreenQuery($galleryId: DBID!) {
        viewer {
          __typename
        }
        galleryById(id: $galleryId) {
          __typename
          ... on Gallery {
            __typename
          }
          ...PublishGalleryFragment
        }
        ...GalleryEditorContextFragment
      }
    `,
    {
      galleryId: route.params.galleryId,
    }
  );

  const { top } = useSafeAreaPadding();
  const gallery = query.galleryById;

  if (!gallery) {
    throw new Error('Gallery not found');
  }

  return (
    <GalleryEditorProvider queryRef={query}>
      <View
        className="flex flex-col flex-1 bg-white dark:bg-black-900 space-y-4"
        style={{
          paddingTop: top,
        }}
      >
        <PublishGallery galleryRef={gallery} />
      </View>
    </GalleryEditorProvider>
  );
}

export function PublishGalleryScreen() {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white dark:bg-black-900">
      <Suspense fallback={null}>
        <InnerPublishGalleryScreen />
      </Suspense>
    </KeyboardAvoidingView>
  );
}
