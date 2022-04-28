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
          <div key={url} className="image">
            <img src={url} />
          </div>
        ))}
      </div>
      <div className="byline">
        <div className="username">{unescape(title)}</div>
        {description ? (
          <>
            <div className="separator" />
            <div className="bio truncate">
              <Markdown text={unescape(description)} />
            </div>
          </>
        ) : null}
      </div>
    </div>
    <style jsx>{`
      .container {
        width: 100%;
        height: 100%;
        min-height: 200px;
        background: #f9f9f9;
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
      }
      .gallery {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        padding: 40px;
        gap: 20px;
      }
      .image {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .gallery img {
        max-width: 100%;
        max-height: 170px;
        width: auto;
        height: auto;
      }
      .byline {
        padding: 0 1.25rem 0.5rem;
        display: flex;
        align-items: center;
        gap: 1em;
        color: rgba(115, 115, 115, 1);
      }
      .username {
        font-family: 'GT Alpina';
        font-weight: 400;
        font-size: 18px;
        color: black;
        flex-shrink: 0;
        letter-spacing: -4%;
      }
      .separator {
        display: inline-block;
        width: 1.5rem;
        height: 1px;
        background: currentColor;
        flex-shrink: 0;
      }
      .bio {
        font-family: 'ABC Diatype';
        font-size: 14px;
        font-weight: 400;
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
