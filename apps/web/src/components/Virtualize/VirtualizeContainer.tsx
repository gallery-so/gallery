import styled from 'styled-components';

type Props = {
  yPosition: number;
  children: React.ReactNode;
};

export default function VirtualizedContainer({ yPosition, children }: Props) {
  return <Container yPosition={yPosition}>{children}</Container>;
}

const Container = styled.div<{
  yPosition: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${({ yPosition }) => yPosition}px);
`;
