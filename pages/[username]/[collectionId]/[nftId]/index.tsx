import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { Nft } from 'types/Nft';
import { getImageSrcSet } from 'utils/imageSrcSet';

type NftDetailPageProps = MetaTagProps & {
  nft?: Nft;
};

export default function NftDetailPage({ nft }: NftDetailPageProps) {
  if (!nft) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<NftDetailPageScene nft={nft} />} footerIsFixed />;
}

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const nftId = params?.nftId ? (params.nftId as string) : undefined;

  // retrieve nft from db
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/glry/v1/nfts/get?id=${nftId}`);
  const data = await res.json();

  if (!data?.nft) {
    return {
      notFound: true,
    };
  }

  // generate srcset for image resizing
  const imageSrcSet = getImageSrcSet(data.nft.image_original_url, 600);

  return {
    props: {
      nft: { ...data.nft, imageSrcSet },
      metaTags: nftId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/nft/${nftId}`,
          })
        : null,
    },
  };
};
