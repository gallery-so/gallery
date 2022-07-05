import { pageGutter } from 'components/core/breakpoints';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseM, TitleM } from 'components/core/Text/Text';
import unescape from 'lodash/unescape';
import styled from 'styled-components';

type Props = {
  title: string;
  description: string;
  imageUrls: string[];
  collectorsNote?: string;
};

export const SingleOpenGraphPreview = ({
  title,
  description,
  imageUrls,
  collectorsNote,
}: Props) => {
  return (
    <>
      <StyledContainer>
        <StyledGalleryContainer hasCollectorNote={!!collectorsNote}>
          {imageUrls.map((url) => (
            <StyledImage key={url} src={url} />
          ))}
          {collectorsNote && (
            <StyledCollectorNotes>
              <Markdown text={unescape('“' + collectorsNote + ' ”')} />
            </StyledCollectorNotes>
          )}
        </StyledGalleryContainer>
        <StyledUsername>{unescape(title)}</StyledUsername>
        {description && (
          <StyledDescription>
            <Markdown text={unescape(description)} />
          </StyledDescription>
        )}
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: ${pageGutter.mobile}px;

  background-color: #ffffff;
`;

const StyledGalleryContainer = styled.div<{ hasCollectorNote?: boolean }>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: ${pageGutter.mobile}px;
  align-items: center;

  justify-content: center;
  max-width: 400px;
  margin: 0 auto;

  grid-auto-columns: ${({ hasCollectorNote }) => (hasCollectorNote ? `minmax(0, 1fr)` : `auto`)};
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 190px;
  width: auto;
  height: auto;
  display: block;
  margin: 0 0 0 auto;
`;

const StyledUsername = styled(TitleM)`
  font-style: normal;
`;

const StyledDescription = styled(BaseM)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  max-width: 300px;
`;

const StyledCollectorNotes = styled(TitleM)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
`;
