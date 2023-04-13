import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import ChangeLogPage, { ChangeLogSection } from '~/scenes/About/ChangeLogPage';

import { getSanityUrl } from '.';

type Props = {
  document: ChangeLogSection[];
};

export default function ChangeLog({ document }: Props) {
  return <GalleryRoute element={<ChangeLogPage sections={document} />} navbar={false} />;
}

export const getServerSideProps = async () => {
  const query = encodeURIComponent(`*[ _type == "changeLog" ]`);
  const url = getSanityUrl(query);

  const response = await fetch(url).then((res) => res.json());
  console.log({ response });
  return {
    props: {
      document: response.result,
    },
  };
};
