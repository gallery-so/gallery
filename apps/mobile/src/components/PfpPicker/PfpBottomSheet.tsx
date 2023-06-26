import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, ReactNode, useCallback } from 'react';
import { Text, View, ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionGridIcon } from 'src/icons/CollectionGridIcon';
import { EditPencilIcon } from 'src/icons/EditPencilIcon';
import { RightArrowIcon } from 'src/icons/RightArrowIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { PfpBottomSheetFragment$key } from '~/generated/PfpBottomSheetFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

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
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const { bottom } = useSafeAreaPadding();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleEnsPress = useCallback(() => {}, []);
  const handleChooseFromCollectionPress = useCallback(() => {
    navigation.navigate('ProfilePicturePicker');
  }, [navigation]);
  const handleRemovePress = useCallback(() => {}, []);

  const hasProfilePictureSet = false;

  return (
    <GalleryBottomSheetModal
      ref={ref}
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
          <SettingsRow
            onPress={handleEnsPress}
            icon={
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                imageUrl="https://s3-alpha-sig.figma.com/img/9424/9002/fa4d390875d2934261baeff954218f5c?Expires=1688342400&Signature=qDpsEWGdY0OX48OJqqgp2ul0NDeiUsBElABsq~Wk-7H7ouyhaNmTQtg~R~AtsJ7kAo03lUgjSqVNrsbQOmnmt-cZEAvG7hH4UZn7LratyWlCq8SKznpQcx8TD3mgvcN-EPzx1bsPAIWGUZ9ahmLHfYhTVs~Nqwi7-~KKCnDTFaxT~Zs6hZHgM9A-~2aNdesbVfnVqAKz1Odt7P2-gsCvvGzrH-D0mhCLcMJR7pBFK8L3V7zOAa4hE8x4i~HLik0jsjNwEdcKs2qv1ruz2m~~egXaTiZC9n4Avta8Ksl4sG4OsxVmbgqWEEYeLLrlGwTiiM7bSqvasO6-G5BoduXQOw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
                size="md"
              />
            }
            text="Use ENS Avatar"
          />
          <SettingsRow
            onPress={handleChooseFromCollectionPress}
            icon={<CollectionGridIcon />}
            text="Choose from collection"
          />
          {hasProfilePictureSet && (
            <SettingsRow
              onPress={handleRemovePress}
              icon={<TrashIcon />}
              text={<Text className="text-red">Remove current profile picture</Text>}
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
};

function SettingsRow({ style, icon, text, onPress }: SettingsRowProps) {
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

        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>{text}</Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}

const ForwardedPfpBottomSheet = forwardRef(PfpBottomSheet);

export { ForwardedPfpBottomSheet as PfpBottomSheet };
