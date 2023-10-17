import { useCallback } from 'react';
import { View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

export type SearchFilterType = 'top' | 'curator' | 'gallery' | 'community';

type FilterElement = {
  label: string;
  value: SearchFilterType;
}[];

type Props = {
  activeFilter: SearchFilterType;
  onChange: (filter: SearchFilterType) => void;
};

const filters: FilterElement = [
  {
    label: 'Top',
    value: 'top',
  },
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

export function SearchFilter({ activeFilter, onChange, ...props }: Props) {
  const handleSelectFilter = useCallback(
    (filter: SearchFilterType) => {
      if (filter === activeFilter) {
        if (filter !== 'top') {
          onChange('top');
        }
      } else {
        onChange(filter);
      }
    },
    [activeFilter, onChange]
  );

  return (
    <View className="flex flex-row gap-1 " {...props}>
      {filters.map((filter) => (
        <GalleryTouchableOpacity
          key={filter.value}
          onPress={() => {
            handleSelectFilter(filter.value);
          }}
          className={`flex h-8 items-center justify-center rounded-3xl border px-3 ${
            activeFilter === filter.value ? 'border-black-800 dark:border-white ' : 'border-metal'
          }`}
          eventElementId="Search Filter Button"
          eventName="Search Filter Button Clicked"
          eventContext={contexts.Search}
          properties={{ variant: filter.value }}
        >
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className={`text-sm ${
              activeFilter === filter.value ? 'text-black-800 dark:text-white' : 'text-metal'
            }`}
          >
            {filter.label}
          </Typography>
        </GalleryTouchableOpacity>
      ))}
    </View>
  );
}
