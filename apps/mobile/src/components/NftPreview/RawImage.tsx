import { computeHeightAndWidth } from "../../computeHeightAndWidth";
import { Image } from "expo-image";
import { useMemo } from "react";

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
    <Image
      cachePolicy="memory-disk"
      style={{
        width,
        height,
      }}
      placeholder={blurhash}
      source={{ uri: url }}
    />
  );
}
