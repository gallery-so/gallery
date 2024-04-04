import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { DraggableSectionStack } from '~/components/GalleryEditor/DraggableSectionStack';
import { GalleryEditorHeader } from '~/components/GalleryEditor/GalleryEditorHeader';
import { GalleryEditorNavbar } from '~/components/GalleryEditor/GalleryEditorNavbar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
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
          ...GalleryEditorHeaderFragment
        }
        ...GalleryEditorContextFragment
      }
    `,
    { galleryId: route.params.galleryId }
  );

  const gallery = query.galleryById;
  const { top } = useSafeAreaPadding();

  if (!gallery) {
    throw new Error('GalleryEditor rendered without a Gallery');
  }

  return (
    <GalleryEditorProvider queryRef={query}>
      <View
        className="flex flex-col flex-1 bg-white dark:bg-black-900"
        style={{
          paddingTop: top,
        }}
      >
        <GalleryEditorNavbar />
        <ScrollView className="flex-1">
          <GalleryEditorHeader galleryRef={gallery} />
          <DraggableSectionStack />
        </ScrollView>
      </View>
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
