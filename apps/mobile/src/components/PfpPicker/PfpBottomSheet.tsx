import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, ReactNode, useCallback, useRef } from 'react';
import { Text, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionGridIcon } from 'src/icons/CollectionGridIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { PfpBottomSheetFragment$key } from '~/generated/PfpBottomSheetFragment.graphql';
import {
  PfpBottomSheetMutation,
  PfpBottomSheetMutation$rawResponse,
} from '~/generated/PfpBottomSheetMutation.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type PfpBottomSheetProps = {
  queryRef: PfpBottomSheetFragment$key;
};

function PfpBottomSheet(
  { queryRef }: PfpBottomSheetProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
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
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const [removeProfileImage, isRemovingProfileImage] =
    usePromisifiedMutation<PfpBottomSheetMutation>(graphql`
      mutation PfpBottomSheetMutation @raw_response_type {
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
  const { bottom } = useSafeAreaPadding();
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleEnsPress = useCallback(() => {}, []);

  const handleChooseFromCollectionPress = useCallback(() => {
    navigation.navigate('ProfilePicturePicker');
  }, [navigation]);

  const handleRemovePress = useCallback(() => {
    let optimisticResponse: PfpBottomSheetMutation$rawResponse | undefined = undefined;
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
        bottomSheetRef.current?.close();
      });
  }, [query.viewer?.id, query.viewer?.user?.id, removeProfileImage, reportError]);

  const hasProfilePictureSet = Boolean(query.viewer?.user?.profileImage?.__typename);
  const potentialEnsProfileImageUrl =
    query.viewer?.user?.potentialEnsProfileImage?.profileImage?.previewURLs?.medium;

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="px-8 flex flex-col space-y-4"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Profile picture</Typography>

        <View className="flex flex-col space-y-2">
          {potentialEnsProfileImageUrl && (
            <SettingsRow
              onPress={handleEnsPress}
              icon={
                <RawProfilePicture
                  eventElementId={null}
                  eventName={null}
                  imageUrl={potentialEnsProfileImageUrl}
                  size="md"
                />
              }
              text="Use ENS Avatar"
            />
          )}
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
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

type SettingsRowProps = {
  onPress: () => void;
  text: ReactNode;
  icon: ReactNode;
  style?: ViewProps['style'];
  textClassName?: string;
};

function SettingsRow({ style, icon, text, onPress, textClassName }: SettingsRowProps) {
  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      eventElementId="settings-row"
      eventName="settings-row-clicked"
      properties={{ text }}
      style={style}
      className="flex flex-row justify-between items-center bg-offWhite dark:bg-black-800 px-3 h-12"
    >
      <View className="flex flex-row space-x-3 items-center">
        <View className="w-6 h-full flex items-center">{icon}</View>

        <Typography className={textClassName} font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          {text}
        </Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}

const ForwardedPfpBottomSheet = forwardRef(PfpBottomSheet);

export { ForwardedPfpBottomSheet as PfpBottomSheet };
