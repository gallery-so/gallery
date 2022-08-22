import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewAssetFragment$key } from '__generated__/NftPreviewAssetFragment.graphql';
import VideoWithLoading from 'components/LoadingAsset/VideoWithLoading';
import FailedNftPreview from './FailedNftPreview';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';
import { useEffect } from 'react';

type Props = {
  tokenRef: NftPreviewAssetFragment$key;
  size: number;
  onLoad: ContentIsLoadedEvent;
  onError: ContentIsLoadedEvent;
};

function NftPreviewAsset({ tokenRef, size, onLoad, onError }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewAssetFragment on Token {
        dbid
        name
        media {
          __typename

          ... on VideoMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on ImageMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on HtmlMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on AudioMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on GltfMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
          ... on UnknownMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
        }
      }
    `,
    tokenRef
  );

  const resizedNft =
    token.media && 'previewURLs' in token.media
      ? graphqlGetResizedNftImageUrlWithFallback(token.media.previewURLs.large, size)
      : null;

  const canRender = resizedNft?.success;

  useEffect(
    function notifyParentOfFailure() {
      // If we know we're not going to render the NFT
      // Immediately notify the parent that we've failed to render
      if (!canRender) {
        onError();
      }
    },
    [canRender, onError]
  );

  if (canRender) {
    const { url: src } = resizedNft;

    // TODO: this is a hack to handle videos that are returned by OS as images.
    // i.e., assets that do not have animation_urls, and whose image_urls all contain
    // links to videos. we should be able to remove this hack once we're off of OS.
    if (src.endsWith('.mp4') || src.endsWith('.webm')) {
      return <VideoWithLoading onLoad={onLoad} onError={onError} src={src} />;
    }

    return (
      <ImageWithLoading
        onLoad={onLoad}
        onError={onError}
        src={src}
        heightType="maxHeightScreen"
        alt={token.name ?? ''}
      />
    );
  } else {
    // This should immediately disappear due to the `notifyParentOfFailure`
    // effect above
    return null;
  }
}

export default NftPreviewAsset;
