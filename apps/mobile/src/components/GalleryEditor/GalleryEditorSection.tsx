import { useDraggable, useDroppable } from '@mgcrea/react-native-dnd';
import clsx from 'clsx';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedCollection } from '~/contexts/GalleryEditor/types';
import { GalleryEditorSectionTokenFragment$key } from '~/generated/GalleryEditorSectionTokenFragment.graphql';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { GallerySkeleton } from '../GallerySkeleton';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { NftPreviewAssetToWrapInBoundary } from '../NftPreview/NftPreviewAsset';
import ProcessedText from '../ProcessedText/ProcessedText';
import { BaseM } from '../Text';
import { GalleryEditorActiveActions } from './GalleryEditorActiveActions';

type Props = {
  collection: StagedCollection;
  isSectionActive: boolean;
  onActiveChange: (id: string | null) => void;
};

export function GalleryEditorSection({ collection, isSectionActive, onActiveChange }: Props) {
  const disabledDrag = !isSectionActive;

  const { activateCollection, activateSection, activeSectionId } = useGalleryEditorActions();

  const { offset, setNodeRef, activeId, setNodeLayout } = useDraggable({
    id: collection.dbid,
    data: {
      id: collection.dbid,
    },
    disabled: disabledDrag,
  });

  const { setNodeRef: setDropRef, setNodeLayout: setDropLayout } = useDroppable({
    id: collection.dbid,
    disabled: disabledDrag,
    data: { id: collection.dbid },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === collection.dbid;
    const style = {
      opacity: isActive ? 0.9 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: offset.x.value,
        },
        {
          translateY: offset.y.value,
        },
      ],
    };
    return style;
  }, [collection.dbid]);

  const handleSelect = useCallback(() => {
    if (isSectionActive) {
      onActiveChange(null);
    } else {
      onActiveChange(collection.dbid);
    }
  }, [collection.dbid, isSectionActive, onActiveChange]);

  const horizontalRowPadding = 16;
  const inBetweenColumnPadding = 0;

  const screenDimensions = useWindowDimensions();

  const handleSectionPress = useCallback(
    (sectionId: string) => {
      activateCollection(collection.dbid);
      activateSection(sectionId);
    },
    [activateCollection, activateSection, collection.dbid]
  );

  return (
    <GalleryTouchableOpacity
      onPress={handleSelect}
      className={clsx('p-2 border border-transparent relative')}
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      <View>
        <Animated.View
          className={clsx('border border-transparent gap-4')}
          ref={(ref) => {
            setNodeRef(ref);
            setDropRef(ref);
          }}
          onLayout={(event) => {
            setNodeLayout(event);
            setDropLayout(event);
          }}
          style={animatedStyle}
        >
          <BaseM classNameOverride="text-base" weight="Bold">
            {collection.name} {collection.dbid}
          </BaseM>
          <ProcessedText text={collection.collectorsNote || ''} />

          <View className="space-y-2">
            {collection.sections.map((section) => {
              const column = section.columns;
              const totalSpaceForTokens =
                screenDimensions.width -
                horizontalRowPadding * 2 -
                inBetweenColumnPadding * (column - 1);

              const widthPerToken = totalSpaceForTokens / column;
              return (
                <GalleryTouchableOpacity
                  eventElementId={null}
                  eventName={null}
                  eventContext={null}
                  onPress={(e) => {
                    e.stopPropagation();
                    console.log('Pressed section', section.id);
                    handleSectionPress(section.id);
                  }}
                  className={clsx('border border-transparent relative', {
                    'border-activeBlue': activeSectionId === section.id,
                  })}
                >
                  <View>
                    <View key={section.id} className="flex-row flex-wrap gap-2">
                      {section.items.map((item) => {
                        if (item.kind === 'whitespace') {
                          return <BaseM key={item.id}>Whitespace</BaseM>;
                        } else {
                          return (
                            <View
                              key={item.id}
                              className="aspect-square"
                              style={{
                                width: widthPerToken - 8,
                              }}
                            >
                              <TokenGridSinglePreview tokenRef={item.tokenRef} />
                            </View>
                          );
                        }
                      })}
                    </View>
                    {activeSectionId === section.id && (
                      <GalleryEditorActiveActions sectionId={collection.dbid} row={section} />
                    )}
                  </View>
                </GalleryTouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </GalleryTouchableOpacity>
  );
}

type TokenGridSinglePreviewProps = {
  tokenRef: GalleryEditorSectionTokenFragment$key;
};

function TokenGridSinglePreview({ tokenRef }: TokenGridSinglePreviewProps) {
  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);

  const token = useFragment(
    graphql`
      fragment GalleryEditorSectionTokenFragment on Token {
        dbid
        definition {
          name
        }
        ...TokenFailureBoundaryFragment
        ...NftPreviewAssetToWrapInBoundaryFragment
      }
    `,
    tokenRef
  );
  const tokenId = token.dbid;

  const { offset, setNodeRef, activeId, setNodeLayout } = useDraggable({
    data: { id: tokenId, name: token.definition.name },
    id: tokenId,
    disabled: false,
  });

  const { setNodeRef: setDropRef, setNodeLayout: setDropLayout } = useDroppable({
    data: { id: tokenId, name: token.definition.name },
    id: tokenId,
    disabled: false,
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === tokenId;
    const style = {
      opacity: isActive ? 0.9 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: offset.x.value,
        },
        {
          translateY: offset.y.value,
        },
      ],
    };
    return style;
  }, [tokenId]);

  return (
    <Animated.View
      ref={(ref) => {
        setNodeRef(ref);
        setDropRef(ref);
      }}
      onLayout={(event) => {
        setNodeLayout(event);
        setDropLayout(event);
      }}
      style={[animatedStyle]}
    >
      {/* <View className="h-16 w-16 bg-red">
        <Text className="text-offWhite">{token.definition.name}</Text>
      </View> */}
      <TokenFailureBoundary tokenRef={token} variant="tiny">
        <NftPreviewAssetToWrapInBoundary
          tokenRef={token}
          mediaSize="medium"
          resizeMode={ResizeMode.COVER}
          onLoad={handleAssetLoad}
        />
        {!assetLoaded && (
          <View className="absolute inset-0">
            <GallerySkeleton borderRadius={0}>
              <SkeletonPlaceholder.Item width="100%" height="100%" />
            </GallerySkeleton>
          </View>
        )}
      </TokenFailureBoundary>
    </Animated.View>
  );
}
