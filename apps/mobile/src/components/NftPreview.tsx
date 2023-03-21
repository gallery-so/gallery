import { ResizeMode, Video } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { SvgWebView } from './SvgWebView';

type NftPreviewProps = {
  tokenRef: NftPreviewFragment$key;
  resizeMode: ResizeMode;
};

function NftPreviewInner({ tokenRef, resizeMode }: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        __typename
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const previews = getVideoOrImageUrlForNftPreview(token);
  const tokenUrl = previews?.urls.medium;

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('NftPreview', 'tokenUrl missing');
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

  // Rare case that we didn't processe the NFT correctly
  // and we still have to deal with an image
  // We'll just load the poster and never play the video
  if (tokenUrl.includes('mp4')) {
    return (
      <Video
        shouldPlay
        isLooping
        resizeMode={resizeMode}
        source={{ uri: tokenUrl }}
        className="h-full w-full"
      />
    );
  }

  return (
    <FastImage
      resizeMode={resizeMode}
      className="h-full w-full overflow-hidden"
      source={{
        headers: { Accepts: 'image/avif;image/png' },
        uri: tokenUrl,
      }}
    />
  );
}

export function NftPreview({ tokenRef, resizeMode }: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={null}>
      <NftPreviewInner tokenRef={tokenRef} resizeMode={resizeMode} />
    </ReportingErrorBoundary>
  );
}
