import { useWidthHeight } from "../../computeHeightAndWidth";
import { Image } from "expo-image";

type RawImageProps = {
  url: string;
};

export function RawImage({ url }: RawImageProps) {
  const { dimensions, handleLoad } = useWidthHeight(url);

  return (
    <Image
      cachePolicy="disk"
      onLoad={(event) => {
        handleLoad(event.source.width, event.source.height);
      }}
      style={{
        ...dimensions,
      }}
      source={{ uri: url }}
    />
  );
}
