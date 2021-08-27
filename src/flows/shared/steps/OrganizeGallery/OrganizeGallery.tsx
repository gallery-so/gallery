import { useCallback, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import CollectionDnd from './CollectionDnd';
import Header from './Header';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useUpdateCollectionInfo from 'hooks/api/collections/useUpdateCollectionInfo';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import useUpdateGallery from 'hooks/api/galleries/useUpdateGallery';
import { Collection } from 'types/Collection';

type ConfigProps = {
  onNext: () => void;
  onPrevious: () => void;
};

function useWizardConfig({ onNext, onPrevious }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);
    setOnPrevious(onPrevious);

    return () => {
      setOnNext(undefined);
      setOnPrevious(undefined);
    };
  }, [setOnPrevious, onPrevious, setOnNext, onNext]);
}

function OrganizeGallery({ next }: WizardContext) {
  const wizardId = useWizardId();
  const user = useAuthenticatedUser();
  const updateGallery = useUpdateGallery();

  const gallery = useAuthenticatedGallery();
  const collections = gallery.collections;
  const [sortedCollections, setSortedCollections] = useState(collections);

  useEffect(() => {
    // when the server sends down its source of truth, sync the local state
    setSortedCollections(collections);
  }, [collections]);

  const returnToProfile = useCallback(() => {
    navigate(`/${user.username}`);
  }, [user.username]);

  const saveGalleryAndReturnToProfile = useCallback(async () => {
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      next();
      return;
    }

    await updateGallery(gallery.id, sortedCollections);
    navigate(`/${user.username}`);
  }, [
    gallery.id,
    next,
    sortedCollections,
    updateGallery,
    user.username,
    wizardId,
  ]);

  useWizardConfig({
    onNext: saveGalleryAndReturnToProfile,
    onPrevious: returnToProfile,
  });

  return (
    <StyledOrganizeGallery>
      <Content>
        <Spacer height={80} />
        <Header />
        <Spacer height={16} />
        <CollectionDnd
          sortedCollections={sortedCollections}
          setSortedCollections={setSortedCollections}
        />
        <Spacer height={120} />
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledOrganizeGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

// type DecoratedGalleryEditorProps = {
//   push: WizardContext['push'];
// };

// function DecoratedGalleryEditor({ push }: DecoratedGalleryEditorProps) {
//   const onNext = useCallback(() => {
//     push('organizeGallery');
//   }, [push]);

//   useWizardConfig({ onNext });

//   return <GalleryEditor/>
// }

// function OrganizeGalleryWithProvider({ push }: WizardContext) {
//   return (
//     <GalleryEditorProvider>
//       <DecoratedGalleryEditor push={push} />
//     </GalleryEditorProvider>
//   );
// }

export default OrganizeGallery;
