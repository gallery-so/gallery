import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

type NftDetailPageProps = {
  nftId?: string;
};

export default function NftDetailPage({ nftId }: NftDetailPageProps) {
  if (!nftId) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<NftDetailPageScene nftId={nftId} />} />;
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => ({
  props: {
    nftId: params?.nftId ? (params.nftId as string) : undefined,
  },
});
