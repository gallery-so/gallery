import colors from 'components/core/colors';
import styled from 'styled-components';

// TODO: Replace with correct figjam url
const FIG_JAM_URL =
  'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FYrjZkebwPMIPr3aFx8o2w1%2FUntitled%3Fnode-id%3D1%253A2';

export default function PosterFigmaFrame() {
  return <StyledIframe src={FIG_JAM_URL}></StyledIframe>;
}

const StyledIframe = styled.iframe`
  border: 1px solid ${colors.porcelain};
  margin: 0 auto;
  width: 100%;
  height: 600px;
`;
