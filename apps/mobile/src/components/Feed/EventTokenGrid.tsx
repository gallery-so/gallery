import { ResizeMode } from 'expo-av';
import { PropsWithChildren, useMemo } from 'react';
import { useWindowDimensions, View, ViewProps } from 'react-native';
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

  const { fullWidth, fullHeight } = useGridDimensions();

  const inner = useMemo(() => {
    const tokensWithMedia = collectionTokens
      .map((collectionToken) => {
        const media = getVideoOrImageUrlForNftPreview({
          tokenRef: collectionToken.token,
          preferStillFrameFromGif: true,
        });

        if (media) {
          return { ...collectionToken, ...media };
        } else {
          return null;
        }
      })
      // This makes sure we're only working with valid media
      .filter(Boolean);

    const [firstToken, secondToken, thirdToken, fourthToken] = tokensWithMedia;

    if (firstToken && secondToken && thirdToken && fourthToken) {
      return (
        <FullCell className="flex flex-1 flex-col justify-between overflow-hidden">
          <HalfHeightRow>
            <QuarterCell>
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={firstToken}
                tokenUrl={firstToken.urls.medium}
              />
            </QuarterCell>
            <QuarterCell>
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={secondToken}
                tokenUrl={secondToken.urls.medium}
              />
            </QuarterCell>
          </HalfHeightRow>

          <HalfHeightRow>
            <QuarterCell>
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={thirdToken}
                tokenUrl={thirdToken.urls.medium}
              />
            </QuarterCell>
            <QuarterCell>
              <NftPreview
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={fourthToken}
                tokenUrl={fourthToken.urls.medium}
              />
            </QuarterCell>
          </HalfHeightRow>
        </FullCell>
      );
    } else if (firstToken && secondToken) {
      return (
        <HalfHeightRow>
          <QuarterCell>
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={firstToken}
              tokenUrl={firstToken.urls.large}
            />
          </QuarterCell>
          <QuarterCell>
            <NftPreview
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={secondToken}
              tokenUrl={secondToken.urls.large}
            />
          </QuarterCell>
        </HalfHeightRow>
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
  }, [collectionTokens, fullHeight, fullWidth, imagePriority, preserveAspectRatio]);

  return (
    <View className="flex flex-1 flex-col pt-1" style={{ width: dimensions.width }}>
      {inner}
    </View>
  );
}

function FullCell({
  children,
  style,
}: PropsWithChildren<{ className?: string; style?: ViewProps['style'] }>) {
  const { fullWidth, fullHeight } = useGridDimensions();

  return (
    <View
      // We use min height here since it's possible that the
      style={[style, { height: fullHeight, width: fullWidth }]}
    >
      {children}
    </View>
  );
}

function QuarterCell({ children }: PropsWithChildren) {
  const { halfHeight, halfWidth } = useGridDimensions();

  return <View style={{ width: halfWidth, flex: 1, minHeight: halfHeight }}>{children}</View>;
}

function HalfHeightRow({ children }: PropsWithChildren) {
  const { halfHeight, fullWidth } = useGridDimensions();

  return (
    <View
      className="flex flex-row justify-between"
      style={{ width: fullWidth, minHeight: halfHeight, flex: 1 }}
    >
      {children}
    </View>
  );
}

function useGridDimensions() {
  const dimensions = useWindowDimensions();

  const fullHeight = dimensions.width;
  const fullWidth = dimensions.width;
  const halfWidth = dimensions.width / 2 - 1; // Account for 2px spacing
  const halfHeight = dimensions.width / 2 - 1; // Account for 2px spacing

  return {
    fullHeight,
    fullWidth,
    halfHeight,
    halfWidth,
  };
}
