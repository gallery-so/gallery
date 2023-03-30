import { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Typography } from '../Typography';

type SearchFilterType = 'curator' | 'gallery' | 'community' | null;

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
  //   {
  //     label: 'Communities',
  //     value: 'community',
  //   },
];

export function SearchFilter({ ...props }) {
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>(null);

  const handleSelectFilter = useCallback((filter: SearchFilterType) => {
    setActiveFilter(filter);
  }, []);

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
            className={activeFilter === filter.value ? 'text-offBlack' : 'text-shadow'}
          >
            {filter.label}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
}
