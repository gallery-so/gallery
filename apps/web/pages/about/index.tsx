import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import AboutPage from '~/scenes/About/AboutPage';

type Props = {
  document: any;
};

export const getSanityUrl = (query: string) => {
  const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!sanityProjectId) {
    throw new Error('Missing CMS project id');
  }

  return `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${query}`;
};

export default function About({ document }: Props) {
  console.log(document);
  const page = document[0];
  // todo handle page not found
  return (
    <GalleryRoute
      element={<AboutPage title={page.title} landingSections={page.landingSections} />}
      navbar={false}
    />
  );
}

// const query = `*[ _type == "document" ]`;

export const getServerSideProps = async () => {
  const query = encodeURIComponent(`*[ _type == "aboutPage" ]`);
  const url = getSanityUrl(query);

  const response = await fetch(url).then((res) => res.json());
  console.log({ response });
  return {
    props: {
      document: response.result,
    },
  };
};
