import { useRouter } from 'next/router';

export default function useIsBaseProfilePage() {
  const { query } = useRouter();

  return typeof query?.username === 'string' && query.username.toLowerCase() === 'base';
}
