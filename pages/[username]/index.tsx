import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';

type UserGalleryProps = MetaTagProps & {
  username?: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  if (!username) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<UserGalleryPage username={username} />} />;
}

export const getServerSideProps: GetServerSideProps<UserGalleryProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  return {
    props: {
      username,
      metaTags: username
        ? [
            {
              property: 'og:image',
              content: `/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/user/${username}`,
              }).toString()}`,
            },
          ]
        : null,
    },
  };
};
