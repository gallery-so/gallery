import { computeHeightAndWidth } from "../../computeHeightAndWidth";
import { useMemo } from "react";
import FastImage from "react-native-fast-image";

type RawImageProps = {
  url: string;
  aspectRatio: string;
  blurhash: string;
};

export function RawImage({ url, aspectRatio, blurhash }: RawImageProps) {
  const { width, height } = useMemo(() => {
    return computeHeightAndWidth(parseFloat(aspectRatio), 250, 250);
  }, []);

  return (
    <FastImage
      style={{
        width,
        height,
      }}
      // placeholder={blurhash}
      source={{ uri: url }}
    />
  );
}
