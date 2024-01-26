import clsx from 'clsx';
import { ResizeMode } from 'expo-av';
import { useState } from 'react';
import { View, ViewProps } from 'react-native';
import FastImage from 'react-native-fast-image';
import { EditPencilIcon } from 'src/icons/EditPencilIcon';

import { GalleryTouchableOpacity, GalleryTouchableOpacityProps } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { DefaultUserIcon } from './DefaultUserIcon';

const sizeMapping: { [size in Size]: number } = {
  xxs: 16,
  xs: 20,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 56,
  xxl: 72,
};

const fontSizeMapping: { [size in Size]: number } = {
  xxs: 8,
  xs: 12,
  sm: 14,
  md: 18,
  lg: 28,
  xl: 32,
  xxl: 40,
};

type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type RawProfilePictureProps = {
  size: Size;
  hasInset?: boolean;
  isEditable?: boolean;
  style?: ViewProps['style'];
} & (
  | {
      letter: string;
    }
  | {
      imageUrl: string | undefined;
    }
  | {
      default: boolean;
    }
) &
  Pick<GalleryTouchableOpacityProps, 'eventElementId' | 'eventName' | 'eventContext' | 'onPress'>;

export function RawProfilePicture({
  size,
  hasInset,
  onPress,
  isEditable,
  style,
  eventElementId,
  eventName,
  eventContext,
  ...rest
}: RawProfilePictureProps) {
  const widthAndHeight = sizeMapping[size];

  let fontSize: number | null = fontSizeMapping[size];
  if (hasInset) {
    fontSize -= 2;
  }

  const [isActive, setIsActive] = useState(false);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      onPressIn={() => setIsActive(true)}
      onPressOut={() => setIsActive(false)}
      activeOpacity={1}
      eventName={eventName}
      eventElementId={eventElementId}
      eventContext={eventContext}
      className="flex justify-center items-center relative rounded-full bg-offWhite dark:bg-black-800"
      style={[
        style,
        {
          width: widthAndHeight,
          height: widthAndHeight,
          padding: hasInset ? 2 : 0,
        },
      ]}
    >
      <View
        className={clsx('flex justify-center items-center w-full h-full rounded-full bg-offWhite', {
          'border border-black-800': 'letter' in rest,
          'border border-faint': 'imageUrl' in rest,
          'border border-shadow': 'default' in rest,
        })}
      >
        {'letter' in rest && (
          <Typography
            font={{ family: 'GTAlpina', weight: 'Light' }}
            className="text-black-800 text-center"
            style={{
              fontSize,
              lineHeight: undefined,
            }}
          >
            {rest.letter}
          </Typography>
        )}

        {'imageUrl' in rest && (
          <FastImage
            className="rounded-full"
            style={{
              width: widthAndHeight - (hasInset ? 4 : 0),
              height: widthAndHeight - (hasInset ? 4 : 0),
            }}
            source={{ uri: rest.imageUrl }}
            resizeMode={ResizeMode.COVER}
          />
        )}

        {'default' in rest && (!('letter' in rest) || rest.letter === '') && <DefaultUserIcon />}

        {isActive && <View className="absolute inset-0 bg-black opacity-25 rounded-full" />}
      </View>

      {isEditable && (
        <View
          className="absolute flex justify-center items-center bg-faint bottom-0 right-0 rounded-full"
          style={{
            width: widthAndHeight / 2,
            height: widthAndHeight / 2,
            transform: [{ translateX: widthAndHeight / 12 }, { translateY: widthAndHeight / 12 }],
          }}
        >
          <EditPencilIcon width={widthAndHeight / 4} height={widthAndHeight / 4} />
        </View>
      )}
    </GalleryTouchableOpacity>
  );
}
