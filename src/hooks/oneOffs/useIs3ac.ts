import { useRouter } from 'next/router';

export function useIs3acProfilePage() {
  const { query } = useRouter();

  return typeof query?.username === 'string' && query?.username?.toLowerCase() === '3ac';
}
