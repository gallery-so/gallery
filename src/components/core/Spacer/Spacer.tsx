import styled from 'styled-components';

type Props = {
  width?: number;
  height?: number;
};

const Spacer = styled.div<Props>`
  width: ${({ width }) => (width ? width : 0)}px;
  height: ${({ height }) => (height ? height : 0)}px;
`;

export default Spacer;
