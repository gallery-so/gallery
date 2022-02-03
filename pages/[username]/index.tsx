import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import Head from 'next/head';

type UserGalleryProps = {
  username?: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  if (!username) {
    return <GalleryRedirect to="/" />;
  }

  return (
    <>
      <Head>
        <title>this should get rendered to the HTML returned from the server</title>
      </Head>
      <GalleryRoute element={<UserGalleryPage username={username} />} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<UserGalleryProps> = async ({ params }) => ({
  props: {
    username: params?.username ? (params.username as string) : undefined,
  },
});
