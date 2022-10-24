import { useRouter } from 'next/router';

export function isUsername3ac(username?: string) {
  return username?.toLowerCase() === '3ac';
}

export default function useIs3acProfilePage() {
  const { query } = useRouter();

  return typeof query?.username === 'string' && isUsername3ac(query.username);
}
