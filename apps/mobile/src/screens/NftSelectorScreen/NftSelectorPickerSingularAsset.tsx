import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { NftSelectorPickerSingularAssetFragment$key } from '~/generated/NftSelectorPickerSingularAssetFragment.graphql';
import { MainTabStackNavigatorProp, RootStackNavigatorParamList } from '~/navigation/types';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import colors from '~/shared/theme/colors';

import { useProfilePicture } from './useProfilePicture';

type NftSelectorPickerSingularAssetProps = {
  style?: ViewProps['style'];
  onSelect: () => void;
  tokenRef: NftSelectorPickerSingularAssetFragment$key;
};

export function NftSelectorPickerSingularAsset({
  style,
  tokenRef,
  onSelect,
}: NftSelectorPickerSingularAssetProps) {
  const token = useFragment(
    graphql`
      fragment NftSelectorPickerSingularAssetFragment on Token {
        __typename
        dbid

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'PostNftSelector'>>();
  const currentScreen = route.params.page;

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const { setProfileImage, isSettingProfileImage } = useProfilePicture();

  const tokenUrl = getVideoOrImageUrlForNftPreview({ tokenRef: token })?.urls.large;

  const [, setError] = useState<string | null>(null);

  const handlePress = useCallback(() => {
    setError(null);

    if (currentScreen === 'ProfilePicture') {
      setProfileImage(token.dbid).then(() => {
        onSelect();
      });
    } else if (currentScreen === 'Community') {
      navigation.navigate('PostComposer', {
        tokenId: token.dbid,
        redirectTo: 'Community',
      });
    } else {
      navigation.navigate('PostComposer', {
        tokenId: token.dbid,
      });
    }
  }, [currentScreen, navigation, onSelect, setProfileImage, token.dbid]);

  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);

  if (!tokenUrl) {
    return <NftPreviewErrorFallback />;
  }

  return (
    <ReportingErrorBoundary
      fallback={
        <View style={style} className="flex-1 aspect-square relative">
          <NftPreviewErrorFallback />
        </View>
      }
    >
      <GalleryTouchableOpacity
        style={style}
        disabled={isSettingProfileImage}
        onPress={handlePress}
        className="flex-1 aspect-square relative"
        eventElementId="NftSelectorPickerImage"
        eventName="NftSelectorPickerImage pressed"
        properties={{ tokenId: token.dbid }}
      >
        <NftPreviewAsset
          tokenUrl={tokenUrl}
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

        {isSettingProfileImage && (
          <View className="absolute inset-0 bg-black opacity-50 flex items-center justify-center">
            <ActivityIndicator color={colors.white} />
          </View>
        )}
      </GalleryTouchableOpacity>
    </ReportingErrorBoundary>
  );
}
