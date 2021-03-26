import { Router } from '@reach/router';
import Home from 'scenes/Home/Home';
import AuthDemo from 'scenes/AuthDemo/AuthDemo';
import NotFound from 'scenes/NotFound/NotFound';

export default function Routes() {
  return (
    <Router>
      <Home path="/" />
      <AuthDemo path="/auth" />
      <NotFound default />
    </Router>
  );
}
