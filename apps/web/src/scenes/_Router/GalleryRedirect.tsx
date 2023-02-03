import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useEffect } from 'react';
import styled from 'styled-components';

type Props = {
  to: Route;
};

// 1) enables redirect without erroring
// 2) wraps in Page component to prevent footer from flashing
export default function GalleryRedirect({ to }: Props) {
  const { push } = useRouter();
  useEffect(() => {
    void push(to);
    // prevent unnecessary successive redirects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Placeholder />;
}

const Placeholder = styled.div`
  height: 100vh;
`;
