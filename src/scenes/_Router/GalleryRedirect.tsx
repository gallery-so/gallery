import Page from 'components/core/Page/Page';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

type Props = {
  to: string;
};

// 1) enables redirect without erroring
// 2) wraps in Page component to prevent footer from flashing
export default function GalleryRedirect({ to }: Props) {
  const { replace } = useRouter();
  useEffect(() => {
    void replace(to);
  }, [replace, to]);

  return <Page />;
}
