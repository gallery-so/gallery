import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MaintenancePage from '~/scenes/MaintenancePage/MaintenancePage';

export default function Maintenance() {
  return <GalleryRoute element={<MaintenancePage />} navbar={false} />;
}
