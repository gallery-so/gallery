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
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';

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

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <FeedLeftContent queryRef={query} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {query.viewer?.__typename ? (
          <FeedCenterContent feedMode={feedMode} onChange={onChange} />
        ) : null}
      </NavbarCenterContent>

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent />
    </StandardNavbarContainer>
  );
}
