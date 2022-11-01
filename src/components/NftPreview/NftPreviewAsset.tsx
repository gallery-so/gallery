import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewAssetFragment$key } from '__generated__/NftPreviewAssetFragment.graphql';
import VideoWithLoading from 'components/LoadingAsset/VideoWithLoading';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import isVideoUrl from 'utils/isVideoUrl';

type Props = {
  tokenRef: NftPreviewAssetFragment$key;
  size: number;
  onLoad: ContentIsLoadedEvent;
};

function NftPreviewAsset({ tokenRef, size, onLoad }: Props) {
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
          ... on GIFMedia {
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

  if (!resizedNft) {
    throw new CouldNotRenderNftError(
      'NftPreviewAsset',
      'could not compute graphqlGetResizedNftImageUrlWithFallback'
    );
  }

  const { url: src } = resizedNft;

  // TODO: this is a hack to handle videos that are returned by OS as images.
  // i.e., assets that do not have animation_urls, and whose image_urls all contain
  // links to videos. we should be able to remove this hack once we're off of OS.
  if (isVideoUrl(src)) {
    return <VideoWithLoading onLoad={onLoad} src={src} />;
  }

  return (
    <ImageWithLoading
      onLoad={onLoad}
      src={src}
      heightType="maxHeightScreen"
      alt={token.name ?? ''}
    />
  );
}

export default NftPreviewAsset;
