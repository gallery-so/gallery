import { pageGutter } from 'components/core/breakpoints';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseXL, TitleL, TitleM } from 'components/core/Text/Text';
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
  const firstLineDescription = description.split('\n')[0];
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
        <StyledTitleContainer>
          <TitleL>{unescape(title)}</TitleL>
          {description && (
            <StyledDescription>
              <Markdown text={unescape(firstLineDescription)} />
            </StyledDescription>
          )}
        </StyledTitleContainer>
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
  padding: ${pageGutter.tablet}px;
  background-color: #ffffff;
  position: relative;
`;

const StyledGalleryContainer = styled.div<{ hasCollectorNote?: boolean }>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: ${pageGutter.tablet}px;
  align-items: center;

  justify-content: center;
  max-width: 80%;
  margin: 0 auto;

  grid-auto-columns: ${({ hasCollectorNote }) => (hasCollectorNote ? `minmax(0, 1fr)` : `auto`)};
`;

const StyledImage = styled.img`
  max-width: 100%;
  height: 265px;
  width: auto;
  display: block;
  margin: 0 0 0 auto;
`;

const StyledTitleContainer = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
`;

const StyledDescription = styled(BaseXL)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  max-width: 600px;
`;

const StyledCollectorNotes = styled(TitleM)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
`;
