import colors from 'components/core/colors';
import { BodyRegular } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  message: string;
};

function EmptyGallery({ message }: Props) {
  return (
    <StyledEmptyGallery>
      <BodyRegular color={colors.gray50}>{message}</BodyRegular>
    </StyledEmptyGallery>
  );
}

const StyledEmptyGallery = styled.div`
  margin: auto;
  height: 400px;
  display: flex;
  align-items: center;
`;

export default EmptyGallery;
