import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { EventTokenGridFragment$key } from '~/generated/EventTokenGridFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { NftPreview } from '../NftPreview';

type EventTokenGridProps = {
  imagePriority: Priority;
  allowPreserveAspectRatio: boolean;
  tokenRefs: EventTokenGridFragment$key;
};

export function EventTokenGrid({
  tokenRefs,
  allowPreserveAspectRatio,
  imagePriority,
}: EventTokenGridProps) {
  const tokens = useFragment(
    graphql`
      fragment EventTokenGridFragment on Token @relay(plural: true) {
        __typename

        dbid

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRefs
  );

  const dimensions = useWindowDimensions();

  const preserveAspectRatio = tokens.length === 1 && allowPreserveAspectRatio;

  const inner = useMemo(() => {
    const tokensWithMedia = tokens.map((token) => {
      const media = getVideoOrImageUrlForNftPreview(token);

      if (media) {
        return { dbid: token.dbid, ...media };
      } else {
        return null;
      }
    });

    const [firstToken, secondToken, thirdToken, fourthToken] = tokensWithMedia;

    if (firstToken && secondToken && thirdToken && fourthToken) {
      return (
        <View className="flex h-full w-full flex-col space-y-[2]">
          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                tokenId={firstToken.dbid}
                tokenUrl={firstToken.urls.small}
              />
            </View>
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                tokenId={secondToken.dbid}
                tokenUrl={secondToken.urls.small}
              />
            </View>
          </View>

          <View className="flex h-1/2 w-full flex-row space-x-[2]">
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                tokenId={thirdToken.dbid}
                tokenUrl={thirdToken.urls.small}
              />
            </View>
            <View className="h-full w-1/2">
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                tokenId={fourthToken.dbid}
                tokenUrl={fourthToken.urls.small}
              />
            </View>
          </View>
        </View>
      );
    } else if (firstToken && secondToken) {
      return (
        <View className="flex w-full flex-row space-x-[2]">
          <View className="h-full w-1/2">
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              tokenId={firstToken.dbid}
              tokenUrl={firstToken.urls.medium}
            />
          </View>
          <View className="h-full w-1/2">
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              tokenId={secondToken.dbid}
              tokenUrl={secondToken.urls.medium}
            />
          </View>
        </View>
      );
    } else if (firstToken) {
      return (
        <View className="h-full w-full">
          <NftPreview
            resizeMode={preserveAspectRatio ? ResizeMode.CONTAIN : ResizeMode.COVER}
            priority={imagePriority}
            tokenId={firstToken.dbid}
            tokenUrl={firstToken.urls.large}
          />
        </View>
      );
    } else {
      throw new Error('Tried to render EventTokenGrid without any tokens');
    }
  }, [imagePriority, preserveAspectRatio, tokens]);

  return (
    <View
      className="flex flex-row flex-wrap"
      style={{ width: dimensions.width, maxHeight: dimensions.height, height: dimensions.width }}
    >
      {inner}
    </View>
  );
}
