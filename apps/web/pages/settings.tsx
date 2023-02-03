import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';

export default function Settings() {
  return <GalleryRedirect to={{ pathname: '/trending', query: { settings: 'true' } }} />;
}
