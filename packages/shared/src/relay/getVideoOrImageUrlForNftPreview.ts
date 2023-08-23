import { graphql, readInlineData } from 'relay-runtime';

import { ReportFn } from '~/contexts/ErrorReportingContext';
import { getVideoOrImageUrlForNftPreviewFragment$key } from '~/generated/getVideoOrImageUrlForNftPreviewFragment.graphql';

type UrlSet = { small: string | null; medium: string | null; large: string | null };

export type getVideoOrImageUrlForNftPreviewArgs = {
  tokenRef: getVideoOrImageUrlForNftPreviewFragment$key;
  preferStillFrameFromGif?: boolean;
  handleReportError?: ReportFn;
};

export type getVideoOrImageUrlForNftPreviewResult =
  | { type: 'video'; urls: UrlSet }
  | { type: 'image'; urls: UrlSet }
  | undefined;

export default function getVideoOrImageUrlForNftPreview({
  tokenRef,
  handleReportError,
  preferStillFrameFromGif,
}: getVideoOrImageUrlForNftPreviewArgs): getVideoOrImageUrlForNftPreviewResult {
  const result = readInlineData(
    graphql`
      fragment getVideoOrImageUrlForNftPreviewFragment on Token @inline {
        dbid
        media {
          ... on VideoMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }

            fallbackMedia {
              mediaURL
            }
          }

          ... on AudioMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on GltfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on HtmlMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on ImageMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on GIFMedia {
            __typename
            staticPreviewURLs {
              small
              medium
              large
            }
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on InvalidMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on JsonMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on TextMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on PdfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }

          ... on UnknownMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
            fallbackMedia {
              mediaURL
            }
          }
        }
      }
    `,
    tokenRef
  );

  const media = result?.media;

  if (!media) {
    return undefined;
  }

  let previewUrls: UrlSet | null = null;
  if (
    'previewURLs' in media &&
    media.previewURLs &&
    (media.previewURLs.small || media.previewURLs.medium || media.previewURLs.large)
  ) {
    previewUrls = media.previewURLs;
  } else if ('fallbackMedia' in media && media.fallbackMedia?.mediaURL) {
    previewUrls = {
      small: media.fallbackMedia.mediaURL,
      medium: media.fallbackMedia.mediaURL,
      large: media.fallbackMedia.mediaURL,
    };
  }

  if (!previewUrls) {
    handleReportError?.(new Error('no media or preview URLs found for NFT'), {
      tags: {
        id: result?.dbid,
        assetType: media?.__typename,
      },
    });
    return undefined;
  }

  if (preferStillFrameFromGif && media.__typename === 'GIFMedia') {
    if (media.staticPreviewURLs) {
      return { type: 'image', urls: media.staticPreviewURLs };
    }
  }

  if (media.__typename === 'VideoMedia') {
    // TODO: we shouldn't need to do this check on the client, but this is a necessary evil
    // until we're on the indexer. in summary, we don't know whether something was categorized
    // as VideoMedia due to its OpenseaImageURL or OpenseaAnimationURL, so we need to do one
    // more check ourselves
    if (previewUrls.large?.endsWith('mp4') || previewUrls.large?.endsWith('webm')) {
      return { type: 'video', urls: previewUrls };
    }

    return { type: 'image', urls: previewUrls };
  }

  return { type: 'image', urls: previewUrls };
}
