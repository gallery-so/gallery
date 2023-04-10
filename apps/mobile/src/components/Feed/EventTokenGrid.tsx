import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { EventTokenGridFragment$key } from '~/generated/EventTokenGridFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { NftPreview } from '../NftPreview/NftPreview';

type EventTokenGridProps = {
  imagePriority: Priority;
  allowPreserveAspectRatio: boolean;
  collectionTokenRefs: EventTokenGridFragment$key;
};

export function EventTokenGrid({
  collectionTokenRefs,
  allowPreserveAspectRatio,
  imagePriority,
}: EventTokenGridProps) {
  const collectionTokens = useFragment(
    graphql`
      fragment EventTokenGridFragment on CollectionToken @relay(plural: true) {
        ...NftPreviewFragment

        token @required(action: THROW) {
          ...getVideoOrImageUrlForNftPreviewFragment
        }
      }
    `,
    collectionTokenRefs
  );

  const dimensions = useWindowDimensions();

  const preserveAspectRatio = collectionTokens.length === 1 && allowPreserveAspectRatio;

  const inner = useMemo(() => {
    const tokensWithMedia = collectionTokens.map((collectionToken) => {
      const media = getVideoOrImageUrlForNftPreview({
        tokenRef: collectionToken.token,
        preferStillFrameFromGif: true,
      });

      if (media) {
        return { ...collectionToken, ...media };
      } else {
        return null;
      }
    });

    const [firstToken, secondToken, thirdToken, fourthToken] = tokensWithMedia;

    const fullHeight = dimensions.width;
    const fullWidth = dimensions.width;
    const halfHeight = dimensions.width / 2;

    if (firstToken && secondToken && thirdToken && fourthToken) {
      return (
        <View
          className="flex flex-1 flex-col space-y-[2]"
          // We use min height here since it's possible that the
          style={{ minHeight: fullHeight, width: fullWidth }}
        >
          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={firstToken}
                tokenUrl={firstToken.urls.medium}
              />
            </View>
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={secondToken}
                tokenUrl={secondToken.urls.medium}
              />
            </View>
          </View>

          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={thirdToken}
                tokenUrl={thirdToken.urls.medium}
              />
            </View>
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={fourthToken}
                tokenUrl={fourthToken.urls.medium}
              />
            </View>
          </View>
        </View>
      );
    } else if (firstToken && secondToken) {
      return (
        <View
          className="flex flex-row space-x-[2]"
          // We use min height here since it's possible that the
          style={{ minHeight: halfHeight, width: fullWidth }}
        >
          <View className="h-full w-1/2">
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={firstToken}
              tokenUrl={firstToken.urls.large}
            />
          </View>
          <View className="h-full w-1/2">
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={secondToken}
              tokenUrl={secondToken.urls.large}
            />
          </View>
        </View>
      );
    } else if (firstToken) {
      return (
        <View
          style={{
            minHeight: fullHeight,
            minWidth: fullWidth,
          }}
        >
          <NftPreview
            resizeMode={preserveAspectRatio ? ResizeMode.CONTAIN : ResizeMode.COVER}
            priority={imagePriority}
            collectionTokenRef={firstToken}
            tokenUrl={firstToken.urls.large}
          />
        </View>
      );
    } else {
      throw new Error('Tried to render EventTokenGrid without any tokens');
    }
  }, [collectionTokens, dimensions.width, imagePriority, preserveAspectRatio]);

  return (
    <View className="flex flex-1 flex-col" style={{ width: dimensions.width }}>
      {inner}
    </View>
  );
}
