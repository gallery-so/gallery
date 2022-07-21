import { useRouter } from 'next/router';

export default function useIs3ac(id?: string | null) {
  return id === '2Bzfbm6WFqL2eqmSMhVCMyTS2Jb';
}

export function useIs3acProfilePage() {
  const { query } = useRouter();

  return typeof query?.username === 'string' && query?.username?.toLowerCase() === '3ac';
}
