import { View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  htmlUrl: string;
  onLoad: () => void;
  onError: () => void;
};

export function NftDetailAssetHtml({ htmlUrl, onLoad, onError }: Props) {
  return (
    <View style={{ width: '100%', aspectRatio: 1 }}>
      <WebView
        onLoadEnd={onLoad}
        onError={onError}
        originWhitelist={['*']}
        className="h-full w-full bg-transparent"
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        source={{ uri: htmlUrl }}
      />
    </View>
  );
}
