import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useAssets } from 'expo-asset';
import { ReactNode, useCallback } from 'react';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionGridIcon } from 'src/icons/CollectionGridIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { PfpBottomSheetFragment$key } from '~/generated/PfpBottomSheetFragment.graphql';
import {
  PfpBottomSheetRemoveProfileImageMutation,
  PfpBottomSheetRemoveProfileImageMutation$rawResponse,
} from '~/generated/PfpBottomSheetRemoveProfileImageMutation.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { useProfilePicture } from '~/screens/NftSelectorScreen/useProfilePicture';
import { contexts } from '~/shared/analytics/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import colors from '~/shared/theme/colors';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { Typography } from '../Typography';

type PfpBottomSheetProps = {
  queryRef: PfpBottomSheetFragment$key;
  onClose: () => void;
};

export default function PfpBottomSheet({ queryRef, onClose }: PfpBottomSheetProps) {
  const query = useFragment(
    graphql`
      fragment PfpBottomSheetFragment on Query {
        viewer {
          ... on Viewer {
            id
            user {
              id
              profileImage {
                __typename
              }
              potentialEnsProfileImage {
                profileImage {
                  previewURLs {
                    medium
                  }
                }
                wallet {
                  chainAddress {
                    chain @required(action: NONE)
                    address @required(action: NONE)
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const [removeProfileImage] =
    usePromisifiedMutation<PfpBottomSheetRemoveProfileImageMutation>(graphql`
      mutation PfpBottomSheetRemoveProfileImageMutation @raw_response_type {
        removeProfileImage {
          ... on RemoveProfileImagePayload {
            viewer {
              user {
                profileImage {
                  __typename
                }
              }
            }
          }
        }
      }
    `);

  const reportError = useReportError();

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { setEnsProfileImage, isSettingsEnsProfilePicture } = useProfilePicture();

  const user = query?.viewer?.user;

  const ensAddress = user?.potentialEnsProfileImage?.wallet?.chainAddress;

  const handleEnsPress = useCallback(() => {
    if (!ensAddress) return;

    setEnsProfileImage({
      address: ensAddress?.address,
      chain: ensAddress?.chain,
    })
      .catch(reportError)
      .then(() => {
        onClose();
      });
  }, [ensAddress, onClose, reportError, setEnsProfileImage]);

  const handleChooseFromCollectionPress = useCallback(() => {
    navigation.navigate('NftSelector', {
      page: 'ProfilePicture',
    });
  }, [navigation]);

  const handleRemovePress = useCallback(() => {
    let optimisticResponse: PfpBottomSheetRemoveProfileImageMutation$rawResponse | undefined =
      undefined;
    if (query.viewer?.id && query.viewer?.user?.id) {
      optimisticResponse = {
        removeProfileImage: {
          __typename: 'RemoveProfileImagePayload',
          viewer: {
            id: query.viewer?.id,
            user: {
              id: query.viewer?.user?.id,
              profileImage: null,
            },
          },
        },
      };
    }

    removeProfileImage({
      variables: {},
      optimisticResponse,
    })
      .catch(reportError)
      .then(() => {
        onClose();
      });
  }, [onClose, query.viewer?.id, query.viewer?.user?.id, removeProfileImage, reportError]);

  const hasProfilePictureSet = Boolean(query.viewer?.user?.profileImage?.__typename);
  const potentialEnsProfileImageUrl =
    query.viewer?.user?.potentialEnsProfileImage?.profileImage?.previewURLs?.medium;

  const [assets] = useAssets([require('../../icons/ens.png')]);

  const ensFallback = assets?.[0]?.localUri;

  const ensSettingsRow = (
    <SettingsRow
      loading={isSettingsEnsProfilePicture}
      onPress={handleEnsPress}
      disabled={!potentialEnsProfileImageUrl}
      icon={
        <RawProfilePicture
          size="md"
          eventElementId="ENS Profile Picture"
          eventName="ENS Profile Picture Press"
          eventContext={contexts.PFP}
          imageUrl={potentialEnsProfileImageUrl ?? ensFallback ?? undefined}
        />
      }
      text="Use ENS Avatar"
    />
  );

  return (
    <View className="flex flex-col space-y-4">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Profile picture</Typography>

      <View className="flex flex-col space-y-2">
        {potentialEnsProfileImageUrl && ensSettingsRow}

        <SettingsRow
          onPress={handleChooseFromCollectionPress}
          icon={<CollectionGridIcon />}
          text="Choose from collection"
        />
        {hasProfilePictureSet && (
          <SettingsRow
            onPress={handleRemovePress}
            icon={<TrashIcon />}
            textClassName="text-red"
            text="Remove current profile picture"
          />
        )}

        {!potentialEnsProfileImageUrl && ensSettingsRow}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  onPress: () => void;
  text: ReactNode;
  icon: ReactNode;
  style?: ViewProps['style'];
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
};

function SettingsRow({
  style,
  loading,
  disabled,
  icon,
  text,
  onPress,
  textClassName,
}: SettingsRowProps) {
  return (
    <GalleryTouchableOpacity
      disabled={disabled}
      onPress={onPress}
      eventElementId="settings-row"
      eventName="settings-row-clicked"
      eventContext={contexts.PFP}
      properties={{ text }}
      style={style}
      className={clsx(
        'relative flex flex-row justify-between items-center bg-offWhite dark:bg-black-800 px-3 h-12',
        {
          'opacity-50': disabled,
        }
      )}
    >
      <View className="flex flex-row space-x-3 items-center">
        <View className="w-6 h-full flex items-center">{icon}</View>

        <Typography className={textClassName} font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          {text}
        </Typography>
      </View>

      {loading && (
        <View className="absolute inset-0 bg-black opacity-50 flex justify-center">
          <ActivityIndicator color={colors.white} />
        </View>
      )}
    </GalleryTouchableOpacity>
  );
}
