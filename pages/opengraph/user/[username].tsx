import useGalleries from 'hooks/api/galleries/useGalleries';
import useUser from 'hooks/api/users/useUser';
import { useRouter } from 'next/router';
import unescape from 'lodash.unescape';

export default function OpenGraphMemberPage() {
  const { query } = useRouter();
  const user = useUser({ username: query.username as string });
  const [gallery] = useGalleries({ userId: user?.id ?? '' }) ?? [];

  if (!user) {
    // TODO: 404?
    throw new Error('no username provided');
  }

  if (!gallery) {
    // TODO: render something nice?
    throw new Error('no gallery found');
  }

  const collection = gallery.collections[0];

  return (
    <>
      <div className="page">
        <div id="opengraph-image" className="container">
          <div className="images">
            {collection.nfts.slice(0, 4).map((nft) => (
              <img
                key={nft.id}
                src={nft.image_url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            ))}
          </div>
          <div className="byline">
            <span className="username">{user.username}</span>
            <span className="separator" />
            <span className="bio truncate">{unescape(user.bio)}</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #eaeded;
        }
        .container {
          width: 600px;
          height: 300px;
          display: grid;
          grid-template-rows: 1fr auto;
        }
        .images {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(0, 1fr);
        }
        .images img {
          width: 100%;
          height: 100%;
          objectfit: cover;
          objectposition: center;
        }
        .byline {
          background: white;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1em;
        }
        .username {
          font-family: 'Gallery Display';
          font-weight: 400;
          font-size: 18px;
        }
        .separator {
          display: inline-block;
          width: 1.5rem;
          height: 1px;
          background: currentColor;
          flex-shrink: 0;
        }
        .bio {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
          font-size: 14px;
          color: rgba(115, 115, 115, 1);
          font-weight: 300;
        }
        .truncate {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
      `}</style>
    </>
  );
}
