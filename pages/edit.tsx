import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';

export default function Edit() {
  return <GalleryAuthenticatedRoute element={<EditGalleryFlow />} freshLayout />;
}
