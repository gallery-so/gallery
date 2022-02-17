import BasicTextPage from './BasicTextPage';
import { privacyPolicyText } from './privacyPolicyText';

export default function PrivacyPolicyPage() {
  return <BasicTextPage title="Privacy Policy" body={privacyPolicyText} />;
}
