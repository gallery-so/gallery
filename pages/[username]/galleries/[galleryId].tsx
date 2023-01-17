import { GetServerSideProps } from 'next';
import { route } from 'nextjs-routes';
import { graphql, useLazyLoadQuery } from 'react-relay';

import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { GalleryIdQuery } from '~/generated/GalleryIdQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GalleryPage from '~/scenes/GalleryPage/GalleryPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type GalleryPageProps = MetaTagProps & {
  username: string;
  galleryId: string;
};

export default function GalleryIdPage({ galleryId, username }: GalleryPageProps) {
  const query = useLazyLoadQuery<GalleryIdQuery>(
    graphql`
      query GalleryIdQuery($username: String!) {
        ...GalleryNavbarFragment
        ...GalleryPageQueryFragment
        ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    {
      username,
    }
  );

  if (!username || !galleryId) {
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return (
    <GalleryRoute
      navbar={<GalleryNavbar username={username} queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <GalleryPage galleryId={galleryId} username={username} queryRef={query} />
        </>
      }
    />
  );
}

export const getServerSideProps: GetServerSideProps<GalleryPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const galleryId = params?.galleryId ? (params.galleryId as string) : undefined;

  if (!username || !galleryId) {
    // How could they have possibly gotten to this route without those params
    return { redirect: { permanent: false, destination: route({ pathname: '/' }) } };
  }

  return {
    props: {
      username,
      galleryId,
      metaTags: galleryId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/user/${username}`,
          })
        : null,
    },
  };
};
