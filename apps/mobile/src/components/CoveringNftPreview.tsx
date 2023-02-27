import { ResizeMode } from 'expo-av';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CoveringNftPreviewFragment$key } from '~/generated/CoveringNftPreviewFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { SvgWebView } from './SvgWebView';

type CoveringNftPreviewProps = {
  tokenRef: CoveringNftPreviewFragment$key;
};

export function CoveringNftPreview({ tokenRef }: CoveringNftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment CoveringNftPreviewFragment on Token {
        __typename
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const previews = getVideoOrImageUrlForNftPreview(token);
  const tokenUrl = previews?.urls.medium;

  if (!tokenUrl) {
    throw new Error('Could not render NFT');
  }

  if (tokenUrl.includes('svg')) {
    return (
      <SvgWebView
        source={{
          uri: tokenUrl,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  return (
    <FastImage
      resizeMode={ResizeMode.COVER}
      className="h-full w-full overflow-hidden"
      source={{
        uri: tokenUrl,
      }}
    />
  );
}
