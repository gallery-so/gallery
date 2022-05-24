import NukeScene from 'scenes/Nuke/Nuke';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Nuke() {
  return <GalleryRoute element={<NukeScene />} navbar={false} />;
}
