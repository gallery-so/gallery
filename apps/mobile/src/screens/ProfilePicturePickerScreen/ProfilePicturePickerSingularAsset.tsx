import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { ProfilePicturePickerSingularAssetFragment$key } from '~/generated/ProfilePicturePickerSingularAssetFragment.graphql';
import { ProfilePicturePickerSingularAssetMutation } from '~/generated/ProfilePicturePickerSingularAssetMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

type ProfilePicturePickerSingularAssetProps = {
  style?: ViewProps['style'];
  onProfilePictureChange: () => void;
  tokenRef: ProfilePicturePickerSingularAssetFragment$key;
};

export function ProfilePicturePickerSingularAsset({
  style,
  tokenRef,
  onProfilePictureChange,
}: ProfilePicturePickerSingularAssetProps) {
  const token = useFragment(
    graphql`
      fragment ProfilePicturePickerSingularAssetFragment on Token {
        __typename
        dbid

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const [setProfileImage, isSettingProfileImage] =
    usePromisifiedMutation<ProfilePicturePickerSingularAssetMutation>(graphql`
      mutation ProfilePicturePickerSingularAssetMutation($input: SetProfileImageInput!) {
        setProfileImage(input: $input) {
          ... on SetProfileImagePayload {
            viewer {
              user {
                ...ProfilePictureFragment
              }
            }
          }
        }
      }
    `);

  const reportError = useReportError();
  const tokenUrl = getVideoOrImageUrlForNftPreview({ tokenRef: token })?.urls.large;

  const [, setError] = useState<string | null>(null);

  const handlePress = useCallback(() => {
    setError(null);

    setProfileImage({
      variables: {
        input: {
          tokenId: token.dbid,
        },
      },
    })
      .then(() => {
        onProfilePictureChange();
      })
      .catch((error) => {
        setError(error);
        reportError(error);
      });
  }, [onProfilePictureChange, reportError, setProfileImage, token.dbid]);
  return (
    <GalleryTouchableOpacity
      style={style}
      disabled={isSettingProfileImage}
      onPress={handlePress}
      className="flex-1 aspect-square relative"
      eventElementId="ProfilePicturePickerImage"
      eventName="ProfilePicturePickerImage pressed"
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
  );
}
