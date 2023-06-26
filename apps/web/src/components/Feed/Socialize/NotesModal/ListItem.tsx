import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';

export const ListItem = styled(HStack)`
  padding: 8px 16px;

  &:first-child {
    padding-top: 0px;
  }
`;
