import { useRouter } from 'next/router';
import { OpenGraphPreview } from 'components/opengraph/OpenGraphPreview';
import useCollectionById from 'hooks/api/collections/useCollectionById';

export default function OpenGraphCollectionPage() {
  const { query } = useRouter();
  const collection = useCollectionById({ id: query.collectionId as string });

  const width = parseInt(query.width as string) || 600;
  const height = parseInt(query.height as string) || 300;

  if (!collection) {
    // TODO: render something nice?
    throw new Error('no collection found');
  }

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={collection.name}
            description={collection.collectors_note}
            imageUrls={collection.nfts
              .filter((nft) => nft.image_url)
              .slice(0, 4)
              .map((nft) => nft.image_url)}
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
