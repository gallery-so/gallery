import { GetServerSideProps } from 'next';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { galleriesQuery } from '~/generated/galleriesQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GalleriesPage from '~/scenes/GalleryPage/GalleriesPage';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';

type GalleriesProps = {
  username: string;
};

export default function Galleries({ username }: GalleriesProps) {
  const query = useLazyLoadQuery<galleriesQuery>(
    graphql`
      query galleriesQuery(
        $username: String!
        $sharedCommunitiesFirst: Int
        $sharedCommunitiesAfter: String
        $sharedFollowersFirst: Int
        $sharedFollowersAfter: String
      ) {
        ...GalleryNavbarFragment
        ...GalleryViewEmitterWithSuspenseFragment
        ...GalleriesPageQueryFragment
        ...StandardSidebarFragment
      }
    `,
    {
      username,
      sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
      sharedFollowersFirst: FOLLOWERS_PER_PAGE,
    },
    { fetchPolicy: 'network-only' }
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
      navbar={<GalleryNavbar galleryRef={null} username={username} queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
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
