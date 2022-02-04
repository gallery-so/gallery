import UserGalleryPage from 'scenes/UserGalleryPage/UserGalleryPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

type UserGalleryProps = {
  username?: string;
};

export default function UserGallery({ username }: UserGalleryProps) {
  if (!username) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<UserGalleryPage username={username} />} />;
}

export const getServerSideProps: GetServerSideProps<UserGalleryProps> = async ({ params }) => ({
  props: {
    username: params?.username ? (params.username as string) : undefined,
  },
});
