import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import PostsFeaturePage from '~/scenes/ContentPages/FeaturePage/PostsFeaturePage';
import { fetchSanityContent, getFeaturePageQueryString } from '~/utils/sanity';

type Props = {
  pageContent: CmsTypes.FeaturePage;
};

export default function CreatorSupportFeatureRoute({ pageContent }: Props) {
  return <GalleryRoute element={<PostsFeaturePage pageContent={pageContent} />} navbar={false} />;
}

export const featurePostsPageContentQuery = getFeaturePageQueryString('creators');

export const getServerSideProps = async () => {
  const content = await fetchSanityContent(featurePostsPageContentQuery);

  return {
    props: {
      pageContent: content[0],
    },
  };
};
