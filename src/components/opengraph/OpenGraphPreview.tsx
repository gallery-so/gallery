import { pageGutter } from 'components/core/breakpoints';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseXL, TitleL } from 'components/core/Text/Text';
import unescape from 'lodash/unescape';
import styled from 'styled-components';

type Props = {
  title: string;
  description: string;
  imageUrls: string[];
};

export const OpenGraphPreview = ({ title, description, imageUrls }: Props) => (
  <>
    <StyledContainer>
      <StyledGalleryContainer>
        <svg
          width="36"
          height="121"
          viewBox="0 0 36 121"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91145C30.5382 2.30539 32.4485 1.05911 33.3845 0.5L35.0311 3.09922C16.1957 15.7113 4.47411 37.841 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
            fill="#141414"
          />
        </svg>

        {imageUrls.map((url) => (
          <StyledImage key={url} src={url} />
        ))}

        <svg
          width="36"
          height="121"
          viewBox="0 0 36 121"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.61135 0.5C40.7972 23.4876 47.3154 77.4014 16.5284 109.395C13.419 112.609 10.0127 115.52 6.3554 118.089C5.45766 118.695 3.55164 119.941 2.61561 120.5L0.968994 117.901C19.8045 105.289 31.5262 83.159 31.3688 60.5C31.5262 37.841 19.8045 15.7113 0.968994 3.09922L2.61135 0.5Z"
            fill="#141414"
          />
        </svg>
      </StyledGalleryContainer>
      <TitleL>{unescape(title)}</TitleL>
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
  padding: ${pageGutter.tablet}px;
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

const StyledDescription = styled(BaseXL)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;
