import { Router } from '@reach/router';
import Home from 'scenes/Home/Home';
import AuthDemo from 'scenes/AuthDemo/AuthDemo';

export default function Routes() {
  return (
    <Router>
      <Home path="/" />
      <AuthDemo path="/auth" />
    </Router>
  );
}
