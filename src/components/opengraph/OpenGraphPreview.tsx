import Markdown from 'components/core/Markdown/Markdown';
import unescape from 'lodash/unescape';

type Props = {
  title: string;
  description: string;
  imageUrls: string[];
};

export const OpenGraphPreview = ({ title, description, imageUrls }: Props) => (
  <>
    <div className="container">
      <div className="gallery">
        {imageUrls.map((url) => (
          <div key={url} className="image" style={{ backgroundImage: `url("${url}")` }} />
        ))}
      </div>
      <div className="byline">
        <span className="username">{unescape(title)}</span>
        {description ? (
          <>
            <span className="bio">⸺</span>
            <span className="bio truncate">
              <Markdown text={unescape(description)} />
            </span>
          </>
        ) : null}
      </div>
    </div>
    <style jsx>{`
      .container {
        width: 100%;
        height: 100%;
        min-height: 200px;
        display: grid;
        grid-template-rows: 1fr auto;
        background: white;
      }
      .gallery {
        display: flex;
        items-align: center;
        justify-content: center;
      }
      .image {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }
      .byline {
        background: white;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1em;
        color: rgba(115, 115, 115, 1);
      }
      .username {
        font-family: 'Gallery Display';
        font-weight: 400;
        font-size: 18px;
        color: black;
        flex-shrink: 0;
      }
      .bio {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol', 'Noto Color Emoji';
        font-size: 14px;
        font-weight: 300;
      }
      .truncate {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    `}</style>
  </>
);
