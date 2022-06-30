import { pageGutter } from 'components/core/breakpoints';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseM, TitleM } from 'components/core/Text/Text';
import unescape from 'lodash/unescape';
import styled from 'styled-components';

import OpenBracket from 'public/icons/open_bracket.svg';
import CloseBracket from 'public/icons/close_bracket.svg';

type Props = {
  title: string;
  description: string;
  imageUrls: string[];
};

export const OpenGraphPreview = ({ title, description, imageUrls }: Props) => (
  <>
    <StyledContainer>
      <StyledGalleryContainer>
        <OpenBracket />
        {imageUrls.map((url) => (
          <StyledImage key={url} src={url} />
        ))}
        <CloseBracket />
      </StyledGalleryContainer>
      <TitleM>{unescape(title)}</TitleM>
      {description && (
        <StyledDescription>
          <Markdown text={unescape(description)} />
        </StyledDescription>
      )}
    </StyledContainer>
  </>
);

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: ${pageGutter.mobile}px;
`;

const StyledGalleryContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: ${pageGutter.mobile}px;
  align-items: center;

  justify-content: center;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 190px;
  width: auto;
  height: auto;
  display: block;
  margin: 0 auto;
`;

const StyledDescription = styled(BaseM)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  max-width: 300px;
`;
