import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  message: string;
};

function EmptyGallery({ message }: Props) {
  return (
    <StyledEmptyGallery>
      <BaseM color={colors.gray50}>{message}</BaseM>
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
