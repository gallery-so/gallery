import { View, Text } from 'react-native';
import clsx from 'clsx';
import CloseBracket from 'src/icons/CloseBracket';
import OpenBracket from 'src/icons/OpenBracket';
import FastImage from 'react-native-fast-image';
import { ResizeMode } from 'expo-av';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';

type Props = {
  username: string;
  caption?: string;
  imageUrl: string;
  profileImageUrl?: string;
};

export default function MiniPostOpenGraphPreview({
  username,
  caption,
  imageUrl,
  profileImageUrl,
}: Props) {

  const letter = username?.[0]?.toUpperCase();
  const fallbackProfilePicture = (
    <RawProfilePicture
      eventElementId="ProfilePicture"
      eventName="ProfilePicture pressed"
      // TODO analytics prop drill
      eventContext={null}
      size="xs"
      letter={letter ?? '?'}
    />
  );

  return (
    <View className="flex w-[358]px h-[188px] bg-[#F9F9F9] items-center justify-center">
      <View className="flex flex-row items-center space-x-6">
        <OpenBracket />
        <View className="flex flex-row space-x-5">
          <ImagePreview tokenUrl={imageUrl} onError={() => console.log('error flagged')} />
          <View className="flex flex-col justify-center">
            <View className="flex flex-row items-center space-x-1">
              {profileImageUrl ? (
                <ImagePreview
                  isPfp
                  tokenUrl={profileImageUrl ?? ''}
                  onError={() => console.log('error in pfp flagged')}
                />
              ) : (
                fallbackProfilePicture
              )}
              <Text>{username}</Text>
            </View>
            {caption ? <Text>{caption}</Text> : null}
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

function ImagePreview({ tokenUrl, stacked, onError, isPfp = false }: ImagePreviewProps) {
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
      className={clsx(stacked && 'absolute -bottom-1 -right-1')}
      source={{ uri: tokenUrl }}
      resizeMode={ResizeMode.COVER}
      onError={onError}
    />
  );
}
