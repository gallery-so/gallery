import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/nft';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftPreviewAssetFragment$key } from '__generated__/NftPreviewAssetFragment.graphql';
import { useEffect } from 'react';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import VideoWithLoading from 'components/LoadingAsset/VideoWithLoading';

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
  nftRef: NftPreviewAssetFragment$key;
  size: number;
};

function NftPreviewAsset({ nftRef, size }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftPreviewAssetFragment on Nft {
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
    nftRef
  );

  if (
    nft.media?.__typename === 'VideoMedia' ||
    nft.media?.__typename === 'ImageMedia' ||
    nft.media?.__typename === 'HtmlMedia' ||
    nft.media?.__typename === 'AudioMedia' ||
    nft.media?.__typename === 'GltfMedia' ||
    nft.media?.__typename === 'UnknownMedia'
  ) {
    const src = graphqlGetResizedNftImageUrlWithFallback(nft.media?.previewURLs.large, size);

    // TODO: this is a hack to handle videos that are returned by OS as images.
    // i.e., assets that do not have animation_urls, and whose image_urls all contain
    // links to videos. we should be able to remove this hack once we're off of OS.
    if (src.endsWith('.mp4') || src.endsWith('.webm')) {
      return <VideoWithLoading src={src} />;
    }

    return (
      <ImageWithLoading
        src={src}
        heightType="inherit"
        widthType={src.endsWith('svg') ? 'fullWidth' : 'maxWidth'}
        alt={nft.name ?? ''}
      />
    );
  }

  // TODO: instead of rendering this, just throw to an error boundary and have that report to sentry
  return <UnrenderedPreviewAsset id={nft.dbid} assetType={nft.media?.__typename ?? ''} />;
}

export default NftPreviewAsset;
