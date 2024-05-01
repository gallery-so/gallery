import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAssetToWrapInBoundary } from '~/components/NftPreview/NftPreviewAsset';
import { NftSelectorSelectionIndicator } from '~/components/NftSelector/NftSelectorSelectionIndicator';
import { NftSelectorPickerSingularAssetFragment$key } from '~/generated/NftSelectorPickerSingularAssetFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

type NftSelectorPickerSingularAssetProps = {
  style?: ViewProps['style'];
  tokenRef: NftSelectorPickerSingularAssetFragment$key;
  onPress: (tokenId: string) => void;
  isLoading?: boolean;
  isMultiselectMode?: boolean;
  isSelected?: boolean;
};

export function NftSelectorPickerSingularAsset({
  style,
  tokenRef,
  onPress,
  isLoading,
  isMultiselectMode,
  isSelected = false,
}: NftSelectorPickerSingularAssetProps) {
  const token = useFragment(
    graphql`
      fragment NftSelectorPickerSingularAssetFragment on Token {
        __typename
        dbid

        ...NftPreviewAssetToWrapInBoundaryFragment
        ...TokenFailureBoundaryFragment
      }
    `,
    tokenRef
  );

  const [, setError] = useState<string | null>(null);

  const handlePress = useCallback(() => {
    setError(null);

    onPress(token.dbid);
  }, [onPress, token.dbid]);

  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);

  return (
    <View style={style} className="flex-1 aspect-square relative">
      <GalleryTouchableOpacity
        disabled={isLoading}
        onPress={handlePress}
        eventElementId="NftSelectorPickerImage"
        eventName="NftSelectorPickerImage pressed"
        eventContext={contexts.Posts}
        properties={{ tokenId: token.dbid }}
      >
        <TokenFailureBoundary tokenRef={token} variant="small">
          <NftPreviewAssetToWrapInBoundary
            tokenRef={token}
            mediaSize="large"
            resizeMode={ResizeMode.COVER}
            onLoad={handleAssetLoad}
          />

          {isMultiselectMode && <NftSelectorSelectionIndicator selected={isSelected} />}
          {!assetLoaded && (
            <View className="absolute inset-0">
              <GallerySkeleton borderRadius={0}>
                <SkeletonPlaceholder.Item width="100%" height="100%" />
              </GallerySkeleton>
            </View>
          )}

          {isLoading && (
            <View className="absolute inset-0 bg-black opacity-50 flex items-center justify-center">
              <ActivityIndicator color={colors.white} />
            </View>
          )}
        </TokenFailureBoundary>
      </GalleryTouchableOpacity>
    </View>
  );
}
