import { ResizeMode } from 'expo-av';
import FastImage from 'react-native-fast-image';

import { SvgWebView } from '~/components/SvgWebView';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type Props = {
  imageUrl: string;
  outputDimensions: Dimensions;
  onLoad: (dimensions: Dimensions | null) => void;
  onError: () => void;
};

export function NftDetailAssetImage({ imageUrl, outputDimensions, onLoad, onError }: Props) {
  if (imageUrl.includes('svg')) {
    return (
      <SvgWebView
        source={{ uri: imageUrl }}
        onLoadEnd={() => {
          // We don't know the dimensions of the SVG, so we just pass null
          onLoad(null);
        }}
        onError={onError}
        // Since we don't know the size of the SVG, we'll just render it in a square
        style={{ width: '100%', aspectRatio: 1 }}
      />
    );
  }

  return (
    <FastImage
      style={outputDimensions}
      resizeMode={ResizeMode.CONTAIN}
      // We use FastImage's priority prop to make sure the image is loaded as soon as possible
      // Since this is higher priority than the feed images.
      source={{ uri: imageUrl, priority: FastImage.priority.high }}
      onLoad={(event) => {
        onLoad(event.nativeEvent);
      }}
      onError={onError}
    />
  );
}
