import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useLayoutEffect } from 'react';

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedNavbarFragment$key } from '__generated__/FeedNavbarFragment.graphql';
import { FeedCenterContent } from 'contexts/globalLayout/GlobalNavbar/FeedNavbar/FeedCenterContent';
import { useRouter } from 'next/router';
import { FeedMode } from 'components/Feed/Feed';
import { FeedLeftContent } from 'contexts/globalLayout/GlobalNavbar/FeedNavbar/FeedLeftContent';
import useAuthModal from 'hooks/useAuthModal';

type FeedNavbarProps = {
  queryRef: FeedNavbarFragment$key;
  feedMode: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function FeedNavbar({ queryRef, onChange, feedMode }: FeedNavbarProps) {
  const query = useFragment(
    graphql`
      fragment FeedNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...FeedLeftContentFragment
      }
    `,
    queryRef
  );
  const { setCustomNavLeftContent, setCustomNavCenterContent, setCustomNavRightContent } =
    useGlobalLayoutActions();

  const showAuthModal = useAuthModal();
  const { pathname } = useRouter();
  // This effect handles adding and removing the Feed controls on the navbar when mounting this component, and signing in+out while on the Feed page.
  useLayoutEffect(() => {
    setCustomNavLeftContent(<FeedLeftContent queryRef={query} />);
    setCustomNavRightContent(<div onClick={showAuthModal}>Sign in</div>);

    if (!query.viewer?.__typename) {
      setCustomNavCenterContent(null);
    } else {
      setCustomNavCenterContent(<FeedCenterContent feedMode={feedMode} onChange={onChange} />);
    }
  }, [
    feedMode,
    onChange,
    pathname,
    query,
    query.viewer?.__typename,
    setCustomNavCenterContent,
    setCustomNavLeftContent,
    setCustomNavRightContent,
    showAuthModal,
  ]);

  return null;
}
