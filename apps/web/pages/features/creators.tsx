import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import PostsFeaturePage from '~/scenes/ContentPages/FeaturePage/PostsFeaturePage';
import { fetchSanityContent } from '~/utils/sanity';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function CreatorSupportFeatureRoute({ pageContent }: Props) {
  return <GalleryRoute element={<PostsFeaturePage pageContent={pageContent} />} navbar={false} />;
}

// make most of query reusable/shared with Posts page
export const featurePostsPageContentQuery = `
*[ _type == "featurePage" && id == "creators" ]{
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

export const getServerSideProps = async () => {
  const content = await fetchSanityContent(featurePostsPageContentQuery);

  return {
    props: {
      pageContent: content[0],
    },
  };
};
