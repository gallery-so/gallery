import { useRouter } from 'next/router';

export default function useIsFigure31ProfilePage() {
  const { query } = useRouter();

  const isFigure31ProfilePage =
    typeof query?.username === 'string' && query?.username?.toLowerCase() === 'figure31';

  return isFigure31ProfilePage;
}
