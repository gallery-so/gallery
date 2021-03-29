import { Router } from '@reach/router';
import Home from 'scenes/Home/Home';
import Auth from 'scenes/Auth/Auth';
import NotFound from 'scenes/NotFound/NotFound';

export default function Routes() {
  return (
    <>
      <Router>
        <Home path="/">
          <Auth path="/auth" />
        </Home>
        <NotFound default />
      </Router>
    </>
  );
}
