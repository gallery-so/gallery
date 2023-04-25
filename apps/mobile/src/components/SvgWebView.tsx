import { parse } from 'node-html-parser';
import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';

const heightUnits = Platform.OS === 'ios' ? 'vh' : '%';

const getHTML = (svgContent: string) => `
<html>
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100${heightUnits};
        height: 100${heightUnits};
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
  onLoadEnd?: (dimensions: Dimensions | null) => void;
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

function parseSvg(text: string): { output: string; dimensions: Dimensions | null } {
  const parsedHtml = parse(text);

  const foundSvg = parsedHtml.querySelector('svg');

  let width: number | null = null;
  let height: number | null = null;
  if (foundSvg && !foundSvg.getAttribute('viewbox')) {
    width = parseFloat(foundSvg.getAttribute('width') ?? '');
    height = parseFloat(foundSvg.getAttribute('height') ?? '');

    if (width && height) {
      foundSvg.removeAttribute('width');
      foundSvg.removeAttribute('height');
      foundSvg.setAttribute('viewbox', `0 0 ${width} ${height}`);
    }
  }

  const output = parsedHtml.toString();
  if (width && height) {
    return { output, dimensions: { width, height } };
  } else {
    return { output, dimensions: null };
  }
}

export function SvgWebView({ source, onLoadStart, onLoadEnd, style }: SvgWebViewProps) {
  const uri = source.uri;
  const [svgState, setSvgState] = useState<SvgContentState>({ kind: 'loading' });

  useEffect(() => {
    async function fetchSvg() {
      onLoadStart?.();

      if (uri) {
        if (uri.match(/^data:image\/svg/)) {
          const index = uri.indexOf('<svg');
          const text = uri.slice(index);

          const { output, dimensions } = parseSvg(text);

          onLoadEnd?.(dimensions);

          setSvgState({ kind: 'success', content: output });
        } else {
          try {
            const res = await fetch(uri);
            const text = await res.text();

            const { output, dimensions } = parseSvg(text);

            onLoadEnd?.(dimensions);

            setSvgState({ kind: 'success', content: output });
          } catch (error) {
            setSvgState({
              kind: 'failure',
              error: new ErrorWithSentryMetadata('Could not fetch SVG content', {
                reason: (error as Error).message,
              }),
            });
          }
        }
      }
    }

    fetchSvg();

    // Not dealing with memoization issues right now
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

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
