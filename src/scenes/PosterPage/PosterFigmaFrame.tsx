import colors from 'components/core/colors';
import styled from 'styled-components';

type Props = {
  url: string;
};

export default function PosterFigmaFrame({ url }: Props) {
  // TODO: Replace with correct URL
  const figmaEmbedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURI(url)}`;
  return <StyledIframe src={figmaEmbedUrl}></StyledIframe>;
}

const StyledIframe = styled.iframe`
  border: 1px solid ${colors.porcelain};
  margin: 0 auto;
  width: 100%;
  height: 600px;
`;
