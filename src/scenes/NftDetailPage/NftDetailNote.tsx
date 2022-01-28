import { BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
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
  userOwnsAsset: boolean;
};

function NftDetailNote({ nftCollectorsNote, nftId, userOwnsAsset }: Props) {
  const [noteHeight, setNoteHeight] = useState(48);
  const [isEditing, setIsEditing] = useState(false);

  // TODO: This should be done via API
  const [hasCollectorsNote, setHasCollectorsNote] = useState(true);

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
    setNoteHeight(event.target?.scrollHeight);
  }, []);

  return (
    <StyledContainer>
      <Spacer height={18} />

      {userOwnsAsset ? (
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
      ) : (
        <StyledNoteTitle color={colors.gray50}>Collector&rsquo;s Note</StyledNoteTitle>
      )}

      <Spacer height={4} />
      {isEditing && (
        <StyledTextAreaWithCharCount
          onChange={handleNoteChange}
          placeholder="Tell us about your NFT..."
          defaultValue={collectorsNote}
          currentCharCount={collectorsNote.length}
          maxCharCount={MAX_CHAR_COUNT}
          noteHeight={noteHeight}
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

type TextAreaProps = {
  noteHeight: number;
};

// These two are intentionally styled the same so that editing is seamless
const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)<TextAreaProps>`
  border: none;

  textarea {
    ${({ noteHeight }) => `height: ${noteHeight}px`};

    min-height: 24px;
    // height: 100%;
    max-height: 84px;
    margin: 0;
    padding: 0;
    line-height: 20px;
    font-size: 14px;
    letter-spacing: 0.4px;
    display: block;
    border-bottom: none;
  }

  p {
    right: 20px;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  min-height: 24px;
  height: 100%;
  max-height: 84px;
  line-height: 20px;
  font-size: 14px;
  letter-spacing: 0.4px;
  overflow-y: auto;
`;

const StyledNoteTitle = styled(BodyRegular)`
  text-transform: uppercase;
  font-size: 12px;
`;

export default NftDetailNote;
