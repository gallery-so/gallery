import { CollectionEditorCenterContent } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorCenterContent';
import { CollectionEditorRightContent } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorRightContent';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { Suspense, useLayoutEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorNavbarFragment$key } from '../../../../../__generated__/CollectionEditorNavbarFragment.graphql';
import { CollectionEditorLeftContent } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorLeftContent';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';

type Props = {
  onDone: () => void;
  onCancel: () => void;
  isCollectionValid: boolean;
  queryRef: CollectionEditorNavbarFragment$key;
};

export function CollectionEditorNavbar({ queryRef, isCollectionValid, onDone, onCancel }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNavbarFragment on Query {
        ...CollectionEditorCenterContentFragment
      }
    `,
    queryRef
  );

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <CollectionEditorLeftContent onCancel={onCancel} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {/* Need a fallback here to stop the entire navbar from suspending */}
        <Suspense fallback={null}>
          <CollectionEditorCenterContent queryRef={query} />
        </Suspense>
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionEditorRightContent isCollectionValid={isCollectionValid} onDone={onDone} />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
