import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NukeScene from 'scenes/Nuke/Nuke';

export default function Nuke() {
  return <GalleryRoute element={<NukeScene />} navbar={false} />;
}
