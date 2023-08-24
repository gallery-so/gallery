import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

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
  return (
    <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
      <GalleryTouchableOpacity
        style={style}
        disabled={isSettingProfileImage}
        onPress={handlePress}
        className="flex-1 aspect-square relative"
        eventElementId="NftSelectorPickerImage"
        eventName="NftSelectorPickerImage pressed"
        properties={{ tokenId: token.dbid }}
      >
        {tokenUrl ? (
          <NftPreviewAsset tokenUrl={tokenUrl} resizeMode={ResizeMode.COVER} />
        ) : (
          <NftPreviewErrorFallback />
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
