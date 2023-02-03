import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';

export default function Settings() {
  return <GalleryRedirect to={{ pathname: '/activity', query: { settings: 'true' } }} />;
}
