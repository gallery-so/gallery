import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewAssetFragment$key } from '__generated__/NftPreviewAssetFragment.graphql';
import { useEffect } from 'react';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import VideoWithLoading from 'components/LoadingAsset/VideoWithLoading';
import FailedNftPreview from './FailedNftPreview';
import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';

type UnrenderedPreviewAssetProps = {
  id: string;
  assetType: string;
};

function UnrenderedPreviewAsset({ id, assetType }: UnrenderedPreviewAssetProps) {
  const reportError = useReportError();

  useEffect(() => {
    reportError(new Error('unable to render NftPreviewAsset'), {
      tags: {
        id,
        assetType,
      },
    });
  }, [assetType, id, reportError]);

  return null;
}

type Props = {
  tokenRef: NftPreviewAssetFragment$key;
  size: number;
};

function NftPreviewAsset({ tokenRef, size }: Props) {
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

  const setContentIsLoaded = useSetContentIsLoaded();

  if (
    token.media?.__typename === 'VideoMedia' ||
    token.media?.__typename === 'ImageMedia' ||
    token.media?.__typename === 'HtmlMedia' ||
    token.media?.__typename === 'AudioMedia' ||
    token.media?.__typename === 'GltfMedia' ||
    token.media?.__typename === 'UnknownMedia'
  ) {
    const { url: src, success } = graphqlGetResizedNftImageUrlWithFallback(
      token.media?.previewURLs.large,
      size
    );

    if (!success) {
      return <FailedNftPreview onLoad={setContentIsLoaded} />;
    }

    // TODO: this is a hack to handle videos that are returned by OS as images.
    // i.e., assets that do not have animation_urls, and whose image_urls all contain
    // links to videos. we should be able to remove this hack once we're off of OS.
    if (src.endsWith('.mp4') || src.endsWith('.webm')) {
      return <VideoWithLoading src={src} />;
    }

    return <ImageWithLoading src={src} heightType="maxHeightScreen" alt={token.name ?? ''} />;
  }

  // TODO: instead of rendering this, just throw to an error boundary and have that report to sentry
  return <UnrenderedPreviewAsset id={token.dbid} assetType={token.media?.__typename ?? ''} />;
}

export default NftPreviewAsset;
