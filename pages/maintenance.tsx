import MaintenancePage from 'scenes/MaintenancePage/MaintenancePage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Nuke() {
  return <GalleryRoute element={<MaintenancePage />} navbar={false} />;
}
