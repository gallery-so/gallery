import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';

type Props = {
  isLoading: boolean;
  onClick: () => void;
};

export function SeeMore({ isLoading, onClick }: Props) {
  return (
    <SeeMoreContainer onClick={onClick} role="button">
      {isLoading ? <Loader size="mini" /> : <TitleXS>See more</TitleXS>}
    </SeeMoreContainer>
  );
}
const SeeMoreContainer = styled(VStack)`
  padding: 16px 12px;
  cursor: pointer;
`;
