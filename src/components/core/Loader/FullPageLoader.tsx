import Page from '../Page/Page';
import CapitalGLoader from './CapitalGLoader';

export default function FullPageLoader() {
  return (
    <Page centered withFooterInView={false}>
      <CapitalGLoader />
    </Page>
  );
}
