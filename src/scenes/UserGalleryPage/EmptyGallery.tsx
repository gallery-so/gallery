import colors from 'components/core/colors';
import { BodyRegular } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  message: String;
};

function EmptyGallery({ message }: Props) {
  return (
    <StyledEmptyGalleryy>
      <BodyRegular color={colors.gray50}>{message}</BodyRegular>
    </StyledEmptyGalleryy>
  );
}

const StyledEmptyGalleryy = styled.div`
  margin: auto;
  height: 400px;
  display: flex;
  align-items: center;
`;

export default EmptyGallery;
