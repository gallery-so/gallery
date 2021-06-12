import Page from '../Page/Page';
import Loader from './Loader';

export default function FullPageLoader() {
  return (
    <Page centered withRoomForFooter={false}>
      <Loader size="large" extraThicc />
    </Page>
  );
}
