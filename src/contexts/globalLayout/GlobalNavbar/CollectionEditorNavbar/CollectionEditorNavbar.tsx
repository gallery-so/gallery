import { CollectionEditorCenterContent } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorCenterContent';
import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorNavbarFragment$key } from '../../../../../__generated__/CollectionEditorNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { Button } from 'components/core/Button/Button';

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
        <BackButton onClick={onCancel} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        {/* Need a fallback here to stop the entire navbar from suspending */}
        <Suspense fallback={null}>
          <CollectionEditorCenterContent queryRef={query} />
        </Suspense>
      </NavbarCenterContent>

      <NavbarRightContent>
        <Button disabled={!isCollectionValid} onClick={onDone}>
          Done
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
