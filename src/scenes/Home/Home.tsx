import { memo } from 'react';
import useSwr from 'swr';
import './Home.css';

function Home() {
  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  const { data, error } = useSwr('/test');
  console.log('the result', data, error);

  return (
    <div className="Home">
      <header className="Home-header">GALLERY</header>
    </div>
  );
}

export default memo(Home);
