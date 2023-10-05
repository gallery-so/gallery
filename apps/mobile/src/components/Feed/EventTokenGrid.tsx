import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, View, ViewProps } from 'react-native';
import { Priority } from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  EventTokenGridFragment$data,
  EventTokenGridFragment$key,
} from '~/generated/EventTokenGridFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';

import { NftPreviewWithBoundary } from '../NftPreview/NftPreview';
import { DOUBLE_TAP_WINDOW } from './constants';

type EventTokenGridProps = {
  imagePriority: Priority;
  allowPreserveAspectRatio: boolean;
  collectionTokenRefs: EventTokenGridFragment$key;

  onDoubleTap: () => void;
};

export function EventTokenGrid({
  collectionTokenRefs,
  allowPreserveAspectRatio,
  imagePriority,
  onDoubleTap,
}: EventTokenGridProps) {
  const collectionTokens = useFragment(
    graphql`
      fragment EventTokenGridFragment on CollectionToken @relay(plural: true) {
        collection {
          dbid
        }

        token @required(action: THROW) {
          dbid
          ...getPreviewImageUrlsInlineDangerouslyFragment
        }

        ...NftPreviewWithBoundaryFragment
      }
    `,
    collectionTokenRefs
  );

  const dimensions = useWindowDimensions();

  const preserveAspectRatio = collectionTokens.length === 1 && allowPreserveAspectRatio;

  const { fullWidth, fullHeight } = useGridDimensions();

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const navigateToNftDetail = useCallback(
    (
      collectionToken: EventTokenGridFragment$data[number],
      cachedPreviewAssetUrl: string | null | undefined
    ) => {
      if (collectionToken.token) {
        navigation.push('NftDetail', {
          tokenId: collectionToken.token.dbid,
          collectionId: collectionToken.collection?.dbid ?? null,
          userId: TODO,

          cachedPreviewAssetUrl: cachedPreviewAssetUrl ?? null,
        });
      }
    },
    [navigation]
  );

  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePress = useCallback(
    (
      collectionToken: EventTokenGridFragment$data[number],
      cachedPreviewAssetUrl: string | null | undefined
    ) => {
      // ChatGPT says 200ms is at the fast end for double tapping.
      // I want the single tap flow to feel fast, so I'm going for speed here.
      // Our users better be nimble af.

      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;

        onDoubleTap?.();
      } else {
        singleTapTimeoutRef.current = setTimeout(() => {
          singleTapTimeoutRef.current = null;
          navigateToNftDetail(collectionToken, cachedPreviewAssetUrl);
        }, DOUBLE_TAP_WINDOW);
      }
    },
    [navigateToNftDetail, onDoubleTap]
  );

  useEffect(function cleanupLeftoverTimeouts() {
    return () => {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
    };
  }, []);

  const inner = useMemo(() => {
    const tokensWithMedia = collectionTokens
      .map((collectionToken) => {
        // this is okay to do since we're simply checking for the existence of a token URL
        // to decide whether to display it. we don't need to error if we don't find one.
        const result = getPreviewImageUrlsInlineDangerously({
          tokenRef: collectionToken.token,
          preferStillFrameFromGif: true,
        });

        if (result.type !== 'valid') {
          return null;
        }

        return {
          ...collectionToken,
          ...result?.urls,
        };
      })
      // This makes sure we're only working with valid media
      .filter(Boolean);

    const [firstToken, secondToken, thirdToken, fourthToken] = tokensWithMedia;

    if (firstToken && secondToken && thirdToken && fourthToken) {
      return (
        <FullCell className="flex flex-1 flex-col justify-between overflow-hidden">
          <HalfHeightRow>
            <QuarterCell>
              <NftPreviewWithBoundary
                onPress={() => handlePress(firstToken, firstToken.medium)}
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={firstToken}
                size="medium"
              />
            </QuarterCell>
            <QuarterCell>
              <NftPreviewWithBoundary
                onPress={() => handlePress(secondToken, secondToken.medium)}
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={secondToken}
                size="medium"
              />
            </QuarterCell>
          </HalfHeightRow>

          <HalfHeightRow>
            <QuarterCell>
              <NftPreviewWithBoundary
                onPress={() => handlePress(thirdToken, thirdToken.medium)}
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={thirdToken}
                size="medium"
              />
            </QuarterCell>
            <QuarterCell>
              <NftPreviewWithBoundary
                onPress={() => handlePress(fourthToken, fourthToken.medium)}
                priority={imagePriority}
                resizeMode={ResizeMode.COVER}
                collectionTokenRef={fourthToken}
                size="medium"
              />
            </QuarterCell>
          </HalfHeightRow>
        </FullCell>
      );
    } else if (firstToken && secondToken) {
      return (
        <HalfHeightRow>
          <QuarterCell>
            <NftPreviewWithBoundary
              onPress={() => handlePress(firstToken, firstToken.large)}
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={firstToken}
              size="large"
            />
          </QuarterCell>
          <QuarterCell>
            <NftPreviewWithBoundary
              onPress={() => handlePress(secondToken, secondToken.large)}
              priority={imagePriority}
              resizeMode={ResizeMode.COVER}
              collectionTokenRef={secondToken}
              size="large"
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
          <NftPreviewWithBoundary
            onPress={() => handlePress(firstToken, firstToken.large)}
            resizeMode={preserveAspectRatio ? ResizeMode.CONTAIN : ResizeMode.COVER}
            priority={imagePriority}
            collectionTokenRef={firstToken}
            size="large"
          />
        </View>
      );
    } else {
      throw new Error('Tried to render EventTokenGrid without any tokens');
    }
  }, [collectionTokens, fullHeight, fullWidth, handlePress, imagePriority, preserveAspectRatio]);

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
