
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import MemberListPage from 'scenes/MemberListPage/MemberListPage';

export default function Members() {
    return <GalleryRoute element={<MemberListPage/>} navbar={false} footerVisibleOutOfView />;
}