import { BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import TextButton from 'components/core/Button/TextButton';
import { useCallback, useState, useMemo } from 'react';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import unescape from 'lodash.unescape';
import styled from 'styled-components';
import useUpdateNft from 'hooks/api/nfts/useUpdateNft';
import Markdown from 'components/core/Markdown/Markdown';

const MAX_CHAR_COUNT = 400;

type Props = {
  nftCollectorsNote?: string;
  nftId: string;
};

function NftDetailNote({ nftCollectorsNote, nftId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasCollectorsNote, setHasCollectorsNote] = useState(false);

  const unescapedCollectorsNote = useMemo(() => unescape(nftCollectorsNote), [nftCollectorsNote]);

  const [collectorsNote, setCollectorsNote] = useState(unescapedCollectorsNote ?? '');

  const handleEditCollectorsNote = useCallback(() => {
    setIsEditing(true);
  }, []);

  const updateNft = useUpdateNft();

  const handleSubmitCollectorsNote = useCallback(async () => {
    setIsEditing(false);
    setHasCollectorsNote(true);
    await updateNft(nftId, collectorsNote);
  }, [updateNft, nftId, collectorsNote]);

  const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCollectorsNote(event.target?.value);
  }, []);

  return (
    <StyledContainer>
      <Spacer height={18} />
      <TextButton
        text={
          isEditing
            ? 'Submit'
            : hasCollectorsNote
            ? "Edit Collector's Note"
            : `+ Add Collector's Note`
        }
        onClick={isEditing ? handleSubmitCollectorsNote : handleEditCollectorsNote}
      />

      <Spacer height={8} />
      {isEditing && (
        <StyledTextAreaWithCharCount
          onChange={handleNoteChange}
          placeholder="Tell us about your NFT..."
          defaultValue={collectorsNote}
          currentCharCount={collectorsNote.length}
          maxCharCount={MAX_CHAR_COUNT}
        />
      )}
      {hasCollectorsNote && !isEditing && (
        <StyledCollectorsNote onDoubleClick={handleEditCollectorsNote}>
          <Markdown text={collectorsNote} />
        </StyledCollectorsNote>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

// These two are intentionally styled the same so that editing is seamless
const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  border: none;

  textarea {
    height: 64px;
    margin: 0;
    padding: 0;
    line-height: 20px;
    font-size: 14px;
    letter-spacing: 0.4px;
    display: block;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  height: 64px;
  line-height: 20px;
  font-size: 14px;
  letter-spacing: 0.4px;
  overflow: scroll;
`;

export default NftDetailNote;
