import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { baseUrl } from 'utils/baseUrl';
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
            { property: 'og:title', content: `${username} | Gallery` },
            // TODO: add description
            {
              property: 'og:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/user/${username}`,
              }).toString()}`,
            },
            { property: 'twitter:card', content: 'summary_large_image' },
            {
              property: 'twitter:image',
              content: `${baseUrl}/api/opengraph/image?${new URLSearchParams({
                path: `/opengraph/user/${username}`,
                width: '600',
                height: '314',
              }).toString()}`,
            },
          ]
        : null,
    },
  };
};
