import { ResizeMode } from 'expo-av';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import CloseBracket from 'src/icons/CloseBracket';
import OpenBracket from 'src/icons/OpenBracket';
import { noop } from 'swr/_internal';

import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { Typography } from '~/components/Typography';

type Props = {
  username: string;
  caption?: string;
  imageUrl: string;
  profileImageUrl?: string;
  onError: () => void;
};

export default function MiniPostOpenGraphPreview({
  username,
  caption,
  imageUrl,
  profileImageUrl,
  onError,
}: Props) {
  const letter = username?.[0]?.toUpperCase();
  const fallbackProfilePicture = (
    <RawProfilePicture
      eventElementId="ProfilePicture"
      eventName="ProfilePicture pressed"
      eventContext={null}
      size="xxs"
      letter={letter ?? '?'}
    />
  );

  return (
    <View className="flex w-[358]px h-[188px] bg-offWhite items-center justify-center">
      <View className="flex flex-row items-center space-x-5">
        <OpenBracket />
        <View className="flex flex-row space-x-4">
          <ImagePreview tokenUrl={imageUrl} onError={onError} />
          <View className="flex flex-col justify-center space-y-0.5">
            <View className="flex flex-row items-center space-x-1">
              {profileImageUrl ? (
                <ImagePreview isPfp tokenUrl={profileImageUrl ?? ''} onError={noop} />
              ) : (
                fallbackProfilePicture
              )}
              <Typography
                className="text-xs dark:text-black-500"
                style={{
                  fontSize: 9,
                  lineHeight: 12,
                }}
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {username}
              </Typography>
            </View>
            {caption ? (
              <View className="max-w-[140px]">
                <Typography
                  numberOfLines={5}
                  className="dark:text-black-500"
                  style={{
                    fontSize: 8,
                    lineHeight: 10,
                  }}
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                >
                  {caption}
                </Typography>
              </View>
            ) : (
              <Text>
                <Typography
                  className="text-xs dark:text-black-500"
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                >
                  View this post on
                </Typography>
                <Typography
                  className="text-xs dark:text-black-500"
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                >
                  {' '}
                  gallery.so
                </Typography>
              </Text>
            )}
          </View>
        </View>
        <CloseBracket />
      </View>
    </View>
  );
}

type ImagePreviewProps = {
  tokenUrl: string;
  stacked?: boolean;
  isPfp?: boolean;
  onError: () => void;
};

function ImagePreview({ tokenUrl, onError, isPfp = false }: ImagePreviewProps) {
  return (
    <FastImage
      style={
        isPfp
          ? {
              width: 12,
              height: 12,
              borderRadius: 12,
            }
          : {
              width: 109,
              height: 109,
            }
      }
      source={{ uri: tokenUrl }}
      resizeMode={ResizeMode.CONTAIN}
      onError={onError}
    />
  );
}
