import { useRouter } from 'next/router';
import { OpenGraphPreview } from 'components/opengraph/OpenGraphPreview';
import useNft from 'hooks/api/nfts/useNft';

export default function OpenGraphCollectionPage() {
  const { query } = useRouter();
  const nft = useNft({ id: query.nftId as string });

  const width = parseInt(query.width as string) || 600;
  const height = parseInt(query.height as string) || 300;

  if (!nft) {
    // TODO: render something nice?
    throw new Error('no NFT found');
  }

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={nft.name}
            description={nft.collectors_note || nft.description}
            imageUrls={[nft.image_url]}
          />
        </div>
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e7e5e4;
        }
        #opengraph-image {
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
      `}</style>
    </>
  );
}
