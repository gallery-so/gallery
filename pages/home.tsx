import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';

export default function Home() {
  return <GalleryRedirect to={{ pathname: '/activity' }} />;
}
