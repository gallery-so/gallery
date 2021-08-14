import Page from '../Page/Page';
import CapitalGLoader from './CapitalGLoader';

export default function FullPageLoader() {
  return (
    <Page centered withRoomForFooter={false}>
      <CapitalGLoader />
    </Page>
  );
}
