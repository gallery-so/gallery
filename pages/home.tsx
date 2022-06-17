import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Home() {
  //   const query = useLazyLoadQuery<authQuery>(
  //     graphql`
  //       query authQuery {
  //         ...HomeFragment
  //       }
  //     `,
  //     {}
  //   );

  return <GalleryRoute element={<HomeScene />} navbar={true} />;
}
