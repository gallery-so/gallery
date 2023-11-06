// eslint-disable-next-line no-restricted-imports
import { fetchSanityContent as _fetchSanityContent } from '~/shared/utils/sanity';

export const fetchSanityContent = _fetchSanityContent(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

export function getFeaturePageQueryString(pageId: string) {
  return `
    *[ _type == "featurePage" && id == "${pageId}" ]{
      ...,
      "featureHighlights": featureHighlights[]->{
        heading,
        orientation,
        body,
        externalLink,
        media{
          mediaType,
          image{
            asset->{
              url
            },
            alt
          },
          video{
            asset->{
              url
            }
          }
        }
      },
      "faqModule": faqModule->{
        title,
        faqs
      },
      "splashImage": {
        "asset": splashImage.asset->{
          url
        },
        alt
      }
    } | order(date desc)
    `;
}
