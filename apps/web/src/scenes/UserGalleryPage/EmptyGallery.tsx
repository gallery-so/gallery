import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';

type Props = {
  message: string;
};

function EmptyGallery({ message }: Props) {
  return (
    <StyledEmptyGallery>
      <BaseM>{message}</BaseM>
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
