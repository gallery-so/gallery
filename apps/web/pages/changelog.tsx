import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import ChangelogPage, { ChangelogSection } from '~/scenes/ContentPages/ChangelogPage';
import { fetchSanityContent } from '~/utils/sanity';

type Props = {
  document: ChangelogSection[];
};

export default function Changelog({ document }: Props) {
  return <GalleryRoute element={<ChangelogPage sections={document} />} navbar={false} />;
}

export const getServerSideProps = async () => {
  const content = await fetchSanityContent('*[ _type == "changelog" ] | order(date desc)');

  return {
    props: {
      document: content,
    },
  };
};
