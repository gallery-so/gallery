import { ReportFn } from 'contexts/errorReporting/ErrorReportingContext';
import { readInlineData, graphql } from 'relay-runtime';
import { FALLBACK_URL } from 'utils/token';
import { getVideoOrImageUrlForNftPreviewFragment$key } from '__generated__/getVideoOrImageUrlForNftPreviewFragment.graphql';

type UrlSet = { small: string | null; medium: string | null; large: string | null };

export default function getVideoOrImageUrlForNftPreview(
  tokenRef: getVideoOrImageUrlForNftPreviewFragment$key,
  handleReportError?: ReportFn
): { type: 'video'; urls: UrlSet } | { type: 'image'; urls: UrlSet } | undefined {
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
          }

          ... on AudioMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on GltfMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on HtmlMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on ImageMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on InvalidMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on JsonMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on TextMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }

          ... on UnknownMedia {
            __typename
            previewURLs {
              small
              medium
              large
            }
          }
        }
      }
    `,
    tokenRef
  );

  const media = result?.media;

  if (!media || !('previewURLs' in media) || media?.previewURLs === null) {
    handleReportError?.(new Error('no media or preview URLs found for NFT'), {
      tags: {
        id: result?.dbid,
        assetType: media?.__typename,
      },
    });
    return undefined;
  }

  if (!media.previewURLs.large && !media.previewURLs.medium && !media.previewURLs.small) {
    return {
      type: 'image',
      urls: { large: FALLBACK_URL, medium: FALLBACK_URL, small: FALLBACK_URL },
    };
  }

  if (media.__typename === 'VideoMedia') {
    // TODO: we shouldn't need to do this check on the client, but this is a necessary evil
    // until we're on the indexer. in summary, we don't know whether something was categorized
    // as VideoMedia due to its OpenseaImageURL or OpenseaAnimationURL, so we need to do one
    // more check ourselves
    if (media.previewURLs.large?.endsWith('mp4') || media.previewURLs.large?.endsWith('webm')) {
      return { type: 'video', urls: media.previewURLs };
    }
    return { type: 'image', urls: media.previewURLs };
  }
  return { type: 'image', urls: media.previewURLs };
}
