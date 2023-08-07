import clsx from 'clsx';
import { ResizeMode } from 'expo-av';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

type Props = {
  tokenUrl: string;
  count: number;
};

const sizes = {
  single: {
    width: 56,
    height: 56,
  },
  double: {
    width: 40,
    height: 40,
  },
};

export function NotificationTokenPreview({ tokenUrl, count }: Props) {
  return (
    <View className="relative">
      {count > 1 && <ImagePreview tokenUrl={tokenUrl} count={count} stacked />}
      <ImagePreview tokenUrl={tokenUrl} count={count} />
    </View>
  );
}

type ImagePreviewProps = {
  stacked?: boolean;
} & Props;

function ImagePreview({ tokenUrl, count, stacked }: ImagePreviewProps) {
  return (
    <FastImage
      style={{
        ...sizes[count > 1 ? 'double' : 'single'],
      }}
      className={clsx(
        count > 1 && 'border border-offWhite dark:border-shadow',
        stacked && 'absolute -bottom-1 -right-1'
      )}
      source={{ uri: tokenUrl }}
      resizeMode={ResizeMode.COVER}
    />
  );
}
