import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';

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

type SvgContentState =
  | {
      kind: 'success';
      content: string;
    }
  | {
      kind: 'failure';
      error: Error;
    }
  | { kind: 'loading' };

export function SvgWebView({ source, onLoadStart, onLoadEnd, style }: SvgWebViewProps) {
  const uri = source.uri;
  const [svgState, setSvgState] = useState<SvgContentState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchSvg() {
      if (uri) {
        onLoadStart?.();

        if (uri.match(/^data:image\/svg/)) {
          const index = uri.indexOf('<svg');
          setSvgState({ kind: 'success', content: uri.slice(index) });
        } else {
          try {
            const res = await fetch(uri, { signal });
            const text = await res.text();
            setSvgState({ kind: 'success', content: text });
          } catch (error) {
            setSvgState({
              kind: 'failure',
              error: new ErrorWithSentryMetadata('Could not fetch SVG content', {
                reason: (error as Error).message,
              }),
            });
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

  if (svgState.kind === 'loading') {
    return <View pointerEvents="none" style={style} />;
  } else if (svgState.kind === 'failure') {
    throw svgState.error;
  } else {
    const html = getHTML(svgState.content);

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
  }
}
