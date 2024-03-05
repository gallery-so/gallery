import { useRouter } from 'next/router';

export default function useIsCuratedProfilePage() {
  const { query } = useRouter();

  return typeof query?.username === 'string' && query.username.toLowerCase() === 'curated';
}
