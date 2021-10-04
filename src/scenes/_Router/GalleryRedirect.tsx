import { Redirect } from '@reach/router';
import Page from 'components/core/Page/Page';

type Props = {
  to: string;
};

// 1) enables redirect without erroring
// 2) wraps in Page component to prevent footer from flashing
export default function GalleryRedirect({ to }: Props) {
  return (
    <Page>
      <Redirect to={to} noThrow />
    </Page>
  );
}
