import { pageGutter } from 'components/core/breakpoints';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseXL, TitleL } from 'components/core/Text/Text';
import unescape from 'lodash/unescape';
import styled from 'styled-components';

import OpenBracket from 'public/icons/open_bracket.svg';
import CloseBracket from 'public/icons/close_bracket.svg';

type Props = {
  title: string;
  description: string;
  imageUrls: string[];
};

export const OpenGraphPreview = ({ title, description, imageUrls }: Props) => {
  const firstLineDescription = description.split('\n')[0];
  return (
    <StyledContainer>
      <StyledGalleryContainer>
        <OpenBracket />
        {imageUrls.map((url) => (
          <StyledImage key={url} src={url} />
        ))}
        <CloseBracket />
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

const StyledGalleryContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: ${pageGutter.tablet}px;
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
