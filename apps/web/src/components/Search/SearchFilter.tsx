import { useCallback } from 'react';
import styled from 'styled-components';

import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import { HStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import { GalleryPill } from '../GalleryPill';
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
          eventElementId="Search Filter Pill"
          eventName="Filter Search"
          eventContext={contexts.Search}
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

const StyledButtonPill = styled(GalleryPill)<{ active?: boolean }>`
  background: transparent;

  ${TitleDiatypeM} {
    color: ${({ active }) => (active ? colors.black['800'] : colors.shadow)};
  }

  &:hover {
    ${TitleDiatypeM} {
      color: ${colors.black['800']};
    }
  }
`;
