import { Text, TouchableOpacity } from 'react-native';

export function SearchResult({ ...props }) {
  return (
    <TouchableOpacity className="py-2" {...props}>
      <Text>Altheia</Text>
      <Text>crypto coven | tiffatron</Text>
    </TouchableOpacity>
  );
}
