import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { galleriesQuery } from '~/generated/galleriesQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GalleriesPage from '~/scenes/GalleryPage/GalleriesPage';

type GalleriesProps = {
  username: string;
};

export default function Galleries({ username }: GalleriesProps) {
  const query = useLazyLoadQuery<galleriesQuery>(
    graphql`
      query galleriesQuery($username: String!) {
        ...GalleryNavbarFragment
        ...GalleryViewEmitterWithSuspenseFragment
        ...GalleriesPageQueryFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <GalleriesPage queryRef={query} />
        </>
      }
      footer={false}
      navbar={<GalleryNavbar username={username} queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<GalleriesProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };

  return {
    props: {
      username,
    },
  };
};
