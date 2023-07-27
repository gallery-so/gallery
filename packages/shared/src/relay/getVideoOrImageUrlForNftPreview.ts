import { graphql, readInlineData } from 'relay-runtime';

import { ReportFn } from '~/contexts/ErrorReportingContext';
import { getVideoOrImageUrlForNftPreviewFragment$key } from '~/generated/getVideoOrImageUrlForNftPreviewFragment.graphql';

export type UrlSet = { small: string | null; medium: string | null; large: string | null };

type VideoMediaContentRenderURL = {
  raw: string;
};

export type ContentRenderURL = VideoMediaContentRenderURL | string;

function isVideoMediaContentRenderURL(url: any): url is VideoMediaContentRenderURL {
  return url && typeof url === 'object' && 'raw' in url;
}

export type getVideoOrImageUrlForNftPreviewArgs = {
  tokenRef: getVideoOrImageUrlForNftPreviewFragment$key;
  preferStillFrameFromGif?: boolean;
  handleReportError?: ReportFn;
};

export type getVideoOrImageUrlForNftPreviewResult =
  | { type: 'video'; urls: UrlSet; contentRenderURL: ContentRenderURL }
  | { type: 'image'; urls: UrlSet; contentRenderURL: ContentRenderURL }
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
            contentRenderURLs {
              raw
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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
            contentRenderURL
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

  let contentRenderURL: ContentRenderURL | undefined = undefined;

  if (media.__typename === 'VideoMedia') {
    if (
      'contentRenderURLs' in media &&
      media.contentRenderURLs &&
      isVideoMediaContentRenderURL(media.contentRenderURLs)
    ) {
      contentRenderURL = media.contentRenderURLs?.raw;
    }
  } else {
    if ('contentRenderURL' in media && media.contentRenderURL) {
      contentRenderURL = media.contentRenderURL as ContentRenderURL;
    }
  }

  if (!contentRenderURL) {
    handleReportError?.(new Error('no media or contentRender URLs found for NFT'), {
      tags: {
        id: result?.dbid,
        assetType: media?.__typename,
      },
    });
    return undefined;
  }

  if (media.__typename === 'VideoMedia') {
    // TODO: we shouldn't need to do this check on the client, but this is a necessary evil
    // until we're on the indexer. in summary, we don't know whether something was categorized
    // as VideoMedia due to its OpenseaImageURL or OpenseaAnimationURL, so we need to do one
    // more check ourselves
    if (previewUrls.large?.endsWith('mp4') || previewUrls.large?.endsWith('webm')) {
      return { type: 'video', urls: previewUrls, contentRenderURL };
    }

    return { type: 'image', urls: previewUrls, contentRenderURL };
  }

  return { type: 'image', urls: previewUrls, contentRenderURL };
}
