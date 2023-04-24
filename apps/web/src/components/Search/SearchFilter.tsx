import { useCallback } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';
import { HStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import { ButtonPill } from '../Pill';
import { SearchFilterType } from './Search';

type Props = {
  activeFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
};

type FilterElement = {
  label: string;
  value: SearchFilterType;
}[];

const filters: FilterElement = [
  {
    label: 'Curators',
    value: 'curator',
  },
  {
    label: 'Galleries',
    value: 'gallery',
  },
  {
    label: 'Communities',
    value: 'community',
  },
];

export default function SearchFilter({ activeFilter, onChangeFilter }: Props) {
  const handleFilterChange = useCallback(
    (filter: SearchFilterType) => {
      if (filter === activeFilter) {
        onChangeFilter(null);
        return;
      }
      onChangeFilter(filter);
    },
    [activeFilter, onChangeFilter]
  );

  return (
    <StyledFilterContainer gap={4}>
      {filters.map((filter) => (
        <StyledButtonPill
          key={filter.value}
          active={activeFilter === filter.value}
          onClick={() => handleFilterChange(filter.value)}
        >
          <TitleDiatypeM>{filter.label}</TitleDiatypeM>
        </StyledButtonPill>
      ))}
    </StyledFilterContainer>
  );
}

const StyledFilterContainer = styled(HStack)`
  padding: 8px 16px;
`;

const StyledButtonPill = styled(ButtonPill)<{ active?: boolean }>`
  cursor: pointer;
  ${TitleDiatypeM} {
    color: ${({ active }) => (active ? colors.offBlack : colors.shadow)};
  }

  &:hover {
    ${TitleDiatypeM} {
      color: ${colors.offBlack};
    }
  }
`;
