import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Typography } from '../Typography';

export type SearchFilterType = 'curator' | 'gallery' | 'community' | null;

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
    label: 'Curators',
    value: 'curator',
  },
  {
    label: 'Galleries',
    value: 'gallery',
  },
];

export function SearchFilter({ activeFilter, onChange, ...props }: Props) {
  const handleSelectFilter = useCallback(
    (filter: SearchFilterType) => {
      if (filter === activeFilter) {
        onChange(null);
      } else {
        onChange(filter);
      }
    },
    [activeFilter, onChange]
  );

  return (
    <View className="flex flex-row gap-1" {...props}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          className="border-porcelain rounded-3xl border px-3 py-2"
          onPress={() => {
            handleSelectFilter(filter.value);
          }}
        >
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className={`text-sm ${activeFilter === filter.value ? 'text-offBlack' : 'text-shadow'}`}
          >
            {filter.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
}
