import { RouteProp, useRoute } from '@react-navigation/native';
import { TextInput, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { PublishGalleryPreview } from '~/components/Gallery/PublishGallery/PublishGalleryPreview';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { BaseM } from '~/components/Text';
import { Typography } from '~/components/Typography';
import { PublishGalleryScreenQuery } from '~/generated/PublishGalleryScreenQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';

export function PublishGalleryScreen() {
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'PublishGallery'>>();

  const query = useLazyLoadQuery<PublishGalleryScreenQuery>(
    graphql`
      query PublishGalleryScreenQuery($galleryId: DBID!) {
        viewer {
          __typename
        }
        galleryById(id: $galleryId) {
          __typename
          ...PublishGalleryPreviewFragment
        }
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
    <View
      className="flex flex-col flex-1 bg-white dark:bg-black-900 space-y-4"
      style={{
        paddingTop: top,
      }}
    >
      <View className="p-4 flex-row items-center justify-between">
        <BackButton />

        <View className="flex-row gap-2">
          <Button
            onPress={() => {}}
            text="Publish"
            eventElementId={null}
            eventName={null}
            eventContext={null}
            size="xs"
            fontWeight="Bold"
          />
        </View>
      </View>

      <View className="space-y-6">
        <View className="flex-col items-center">
          <TextInput
            className="text-[32px] leading-[36px] text-metal dark:text-white"
            // onChangeText={setGalleryName}
            placeholder="My Gallery"
            style={{
              fontFamily: 'GTAlpinaLight',
            }}
            autoCorrect={false}
            spellCheck={false}
          >
            <Typography
              font={{
                family: 'GTAlpina',
                weight: 'Light',
              }}
              className="text-[32px] leading-[36px] text-black-900 dark:text-white"
            >
              {/* {galleryName} */}
            </Typography>
          </TextInput>
        </View>
        <View className="w-[300] mx-auto">
          <PublishGalleryPreview galleryRef={gallery} />
        </View>
        <View className="items-center">
          <TextInput
            // onChangeText={setGalleryDescription}
            placeholder="Add a description (optional)"
            className="text-metal"
            multiline
          >
            <BaseM classNameOverride="text-metal leading-1">Add a description (optional)</BaseM>
          </TextInput>
        </View>
      </View>
    </View>
  );
}
