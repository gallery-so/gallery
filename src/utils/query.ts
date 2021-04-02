import { useLocation } from '@reach/router';

export default function useQuery(query: string) {
  const search = new URLSearchParams(useLocation().search);
  return search.get(query);
}
