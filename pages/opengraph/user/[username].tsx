import useGalleries from 'hooks/api/galleries/useGalleries';
import useUser from 'hooks/api/users/useUser';
import { useRouter } from 'next/router';
import { OpenGraphPreview } from 'components/opengraph/OpenGraphPreview';

export default function OpenGraphUserPage() {
  const { query } = useRouter();
  const user = useUser({ username: query.username as string });
  const [gallery] = useGalleries({ userId: user?.id ?? '' }) ?? [];

  const width = parseInt(query.width as string) || 600;
  const height = parseInt(query.height as string) || 300;

  if (!user) {
    // TODO: 404?
    throw new Error('no username provided');
  }

  if (!gallery) {
    // TODO: render something nice?
    throw new Error('no gallery found');
  }

  const nfts = gallery.collections.flatMap((collection) => collection.nfts);

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={user.username}
            description={user.bio}
            imageUrls={nfts.slice(0, 4).map((nft) => nft.image_url)}
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
