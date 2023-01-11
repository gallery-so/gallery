import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { GalleryNameAndDescriptionModalFragment$key } from '~/generated/GalleryNameAndDescriptionModalFragment.graphql';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import Input from '../core/Input/Input';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TextAreaWithCharCount } from '../core/TextArea/TextArea';
import { COLLECTION_DESCRIPTION_MAX_CHAR_COUNT } from '../ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import useUpdateGalleryInfo from './useUpdateGalleryInfo';

type Props = {
  galleryRef: GalleryNameAndDescriptionModalFragment$key;
  onNext: () => void;
};

export default function GalleryNameAndDescriptionModal({ galleryRef, onNext }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNameAndDescriptionModalFragment on Gallery {
        dbid
        name
        description
      }
    `,
    galleryRef
  );

  const { name: previousName, description: previousDescription, dbid } = query;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateGalleryInfo = useUpdateGalleryInfo();

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, []);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    setIsLoading(true);
    updateGalleryInfo({
      id: dbid,
      name,
      description,
    });
    onNext();
    setIsLoading(false);
  }, [dbid, name, description, onNext, updateGalleryInfo]);

  return (
    <StyledCollectionEditInfoForm>
      <VStack gap={16}>
        <Input
          onChange={handleNameChange}
          defaultValue={previousName || ''}
          placeholder="Gallery name"
          autoFocus
          variant="grande"
        />
        <VStack>
          <StyledTextAreaWithCharCount
            onChange={handleDescriptionChange}
            placeholder="Tell us about your gallery..."
            defaultValue={previousDescription || ''}
            currentCharCount={description.length}
            maxCharCount={COLLECTION_DESCRIPTION_MAX_CHAR_COUNT}
            showMarkdownShortcuts
            hasPadding
          />
        </VStack>
        <ButtonContainer>
          <Button onClick={handleSave} disabled={isLoading} pending={isLoading}>
            save
          </Button>
        </ButtonContainer>
      </VStack>
    </StyledCollectionEditInfoForm>
  );
}

const StyledCollectionEditInfoForm = styled(VStack)`
  padding-top: 16px;
  @media only screen and ${breakpoints.tablet} {
    padding: 0px;
  }
`;

const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  height: 144px;
`;

const ButtonContainer = styled(HStack)`
  padding-top: 12px;
  justify-content: flex-end;
`;
