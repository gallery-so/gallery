import styled from 'styled-components';

type Props = {
  width?: number;
  height?: number;
};

/**
 * @deprecated Please use HStack, VStack, and Spacer
 */
const DeprecatedSpacer = styled.div<Props>`
  width: ${({ width }) => (width ? width : 0)}px;
  height: ${({ height }) => (height ? height : 0)}px;
`;

export default DeprecatedSpacer;
