import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import ChangelogPage, { ChangelogSection } from '~/scenes/ContentPages/ChangelogPage';

type Props = {
  document: ChangelogSection[];
};

export const getSanityUrl = (query: string) => {
  const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!sanityProjectId) {
    throw new Error('Missing CMS project id');
  }

  return `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${query}`;
};

export default function Changelog({ document }: Props) {
  return <GalleryRoute element={<ChangelogPage sections={document} />} navbar={false} />;
}

export const getServerSideProps = async () => {
  const query = encodeURIComponent(`*[ _type == "changelog" ]`);
  const url = getSanityUrl(query);

  const response = await fetch(url).then((res) => res.json());
  console.log({ response });
  return {
    props: {
      document: response.result,
    },
  };
};
