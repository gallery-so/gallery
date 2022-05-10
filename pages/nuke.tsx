import NukeScene from 'scenes/Nuke/Nuke';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function Nuke() {
  return <GalleryV2Route element={<NukeScene />} navbar={false} />;
}
