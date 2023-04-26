import { LRUCache } from 'lru-cache';
import { parse } from 'node-html-parser';
import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';

type CachedSvgValue = {
  dimensions: Dimensions | null;
  content: string;
};

// At least one of 'max', 'ttl', or 'maxSize' is required, to prevent
// unsafe unbounded storage.
//
// In most cases, it's best to specify a max for performance, so all
// the required memory allocation is done up-front.
//
// All the other options are optional, see the sections below for
// documentation on what each one does.  Most of them can be
// overridden for specific items in get()/set()
// eslint-disable-next-line @typescript-eslint/ban-types
const options: LRUCache.Options<string, CachedSvgValue, void> = {
  max: 500,

  // how long to live in ms
  ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  allowStale: true,

  updateAgeOnGet: true,
  updateAgeOnHas: false,

  // async method to use for cache.fetch(), for
  // stale-while-revalidate type of behavior
  fetchMethod: async (uri) => {
    if (uri.match(/^data:image\/svg/)) {
      const index = uri.indexOf('<svg');
      const text = uri.slice(index);

      return parseSvg(text);
    } else {
      return fetch(uri)
        .then((response) => response.text())
        .then((text) => {
          return parseSvg(text);
        });
    }
  },
};

const cache = new LRUCache(options);

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

function parseSvg(text: string): CachedSvgValue {
  try {
    const parsedHtml = parse(text);

    const foundSvg = parsedHtml.querySelector('svg');

    let width: number | null = null;
    let height: number | null = null;
    if (foundSvg) {
      const viewbox = foundSvg.getAttribute('viewbox');

      if (viewbox) {
        // Viewbox comes in the form of x y width height
        // We only care about the width and height so we just
        // slice off the first two values.
        const [w, h] = viewbox.split(' ').slice(2).map(parseFloat);

        if (w && h) {
          width = w;
          height = h;
        }
      } else {
        width = parseFloat(foundSvg.getAttribute('width') ?? '');
        height = parseFloat(foundSvg.getAttribute('height') ?? '');

        if (width && height) {
          foundSvg.removeAttribute('width');
          foundSvg.removeAttribute('height');
          foundSvg.setAttribute('viewbox', `0 0 ${width} ${height}`);
        }
      }
    }

    const content = parsedHtml.toString();
    if (width && height) {
      return { content, dimensions: { width, height } };
    } else {
      return { content, dimensions: null };
    }
  } catch (e) {
    return { content: text, dimensions: null };
  }
}

export function SvgWebView({ source, onLoadStart, onLoadEnd, style }: SvgWebViewProps) {
  const uri = source.uri;
  const [svgState, setSvgState] = useState<SvgContentState>({ kind: 'loading' });

  useEffect(() => {
    cache.fetch(uri).then((value) => {
      if (value) {
        onLoadStart?.();
        console.log(value);
        setSvgState({ kind: 'success', content: value.content });
        onLoadEnd?.(value.dimensions);
      }
    });

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
