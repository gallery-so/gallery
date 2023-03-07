import DrawerHeader from '~/contexts/globalLayout/GlobalSidebar/DrawerHeader';

import SearchInput from './SearchInput';

export default function Search() {
  return (
    <>
      <DrawerHeader>
        <SearchInput />
      </DrawerHeader>
    </>
  );
}
