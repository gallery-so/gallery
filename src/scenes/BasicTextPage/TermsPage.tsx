import BasicTextPage from './BasicTextPage';
import { termsText } from './termsText';

export default function TermsPage() {
  return <BasicTextPage title="Terms of Service" body={termsText} />;
}
