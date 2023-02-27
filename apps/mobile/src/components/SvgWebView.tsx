import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

const heightUnits = Platform.OS === 'ios' ? 'vh' : '%';

const getHTML = (svgContent: string) => `
<html>
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100${heightUnits};
        width: 100${heightUnits};
        overflow: hidden;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      svg {
        min-height: 100%;
        min-width: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
</html>
`;

type SvgWebViewProps = {
  source: { uri: string };
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  style: StyleProp<ViewStyle>;
};

export function SvgWebView({ source, onLoadStart, onLoadEnd, style }: SvgWebViewProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const uri = source.uri;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchSvg() {
      if (uri) {
        onLoadStart?.();

        if (uri.match(/^data:image\/svg/)) {
          const index = uri.indexOf('<svg');
          setSvgContent(uri.slice(index));
        } else {
          try {
            const res = await fetch(uri, { signal });
            const text = await res.text();
            setSvgContent(text);
          } catch (err) {
            console.error('got error', err);
          }
        }

        onLoadEnd?.();
      }
    }

    fetchSvg();

    return () => {
      controller.abort();
    };
  }, [onLoadEnd, onLoadStart, uri]);

  if (svgContent) {
    const html = getHTML(svgContent);

    return (
      <View pointerEvents="none" style={style}>
        <WebView
          originWhitelist={['*']}
          className="h-full w-full bg-transparent"
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          source={{ html }}
        />
      </View>
    );
  } else {
    return <View pointerEvents="none" style={style} />;
  }
}
