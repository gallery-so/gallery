import { BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import TextButton from 'components/core/Button/TextButton';
import { useCallback, useState, useMemo, useRef } from 'react';
import { TextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import unescape from 'lodash.unescape';
import styled from 'styled-components';
import useUpdateNft from 'hooks/api/nfts/useUpdateNft';
import Markdown from 'components/core/Markdown/Markdown';
import breakpoints from 'components/core/breakpoints';
import ErrorText from 'components/core/Text/ErrorText';
import formatError from 'errors/formatError';
import { GLOBAL_FOOTER_HEIGHT } from 'components/core/Page/constants';

const MAX_CHAR_COUNT = 400;
const MIN_NOTE_HEIGHT = 100;

type Props = {
  nftCollectorsNote?: string;
  nftId: string;
  userOwnsAsset: boolean;
};

function NftDetailNote({ nftCollectorsNote, nftId, userOwnsAsset }: Props) {
  // Generic error that doesn't belong to collector's note
  const [generalError, setGeneralError] = useState('');

  const [noteHeight, setNoteHeight] = useState(MIN_NOTE_HEIGHT);
  const [isEditing, setIsEditing] = useState(false);

  const [collectorsNote, setCollectorsNote] = useState(nftCollectorsNote ?? '');
  const unescapedCollectorsNote = useMemo(() => unescape(collectorsNote), [collectorsNote]);

  const hasCollectorsNote = useMemo(() => collectorsNote.length > 0, [collectorsNote]);

  const collectorsNoteRef = useRef<HTMLDivElement>(null);

  const handleEditCollectorsNote = useCallback(() => {
    setIsEditing(true);

    // Scroll down - wait 100ms so that element exists before scrolling to bottom of it
    setTimeout(() => {
      if (collectorsNoteRef.current) {
        collectorsNoteRef.current.scrollIntoView({
          block: 'end',
          inline: 'nearest',
          behavior: 'smooth',
        });
      }
    }, 200);
  }, []);

  const updateNft = useUpdateNft();

  const handleSubmitCollectorsNote = useCallback(async () => {
    setGeneralError('');

    if (collectorsNote.length > MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return;
    }

    setIsEditing(false);

    try {
      await updateNft(nftId, collectorsNote);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(formatError(error));
      }
    }
  }, [updateNft, nftId, collectorsNote]);

  const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCollectorsNote(event.target?.value);
    setNoteHeight(event.target?.scrollHeight);

    // On clear, reset note height (textarea scrollHeight does not decrease on its own, it only increases)
    // So we use this hard reset if the user deletes all content. Could have more elegant solution
    if (event.target?.value === '') {
      setNoteHeight(MIN_NOTE_HEIGHT);
    }

    // TODO if user deleted some text, shrink textarea height
  }, []);

  return (
    <StyledContainer isEditing={isEditing} ref={collectorsNoteRef}>
      <Spacer height={18} />

      {userOwnsAsset ? (
        <TextButton
          disabled={collectorsNote.length > MAX_CHAR_COUNT}
          text={
            isEditing
              ? "Save Collector's Note"
              : hasCollectorsNote
              ? "Edit Collector's Note"
              : `+ Add Collector's Note`
          }
          onClick={isEditing ? handleSubmitCollectorsNote : handleEditCollectorsNote}
        />
      ) : (
        <StyledNoteTitle color={colors.gray50}>Collector&rsquo;s Note</StyledNoteTitle>
      )}
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={4} />
      {isEditing && (
        <StyledTextAreaWithCharCount
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          onChange={handleNoteChange}
          placeholder="Tell us about your NFT..."
          defaultValue={collectorsNote}
          currentCharCount={collectorsNote.length}
          maxCharCount={MAX_CHAR_COUNT}
          noteHeight={noteHeight}
        />
      )}

      {hasCollectorsNote && !isEditing && (
        <StyledCollectorsNote
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          onDoubleClick={handleEditCollectorsNote}
        >
          <Markdown text={unescapedCollectorsNote} />
        </StyledCollectorsNote>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  // On tablet and smaller, the note will have the same styling as the NftDetailText (it will be directly on top of it)
  display: block;
  max-width: 296px;
  min-width: 296px;
  margin: auto;
  word-wrap: break-word;

  // On larger screens, the note will be sized according to its parent container and will be flush with the asset
  @media only screen and ${breakpoints.tablet} {
    width: 100%;
    min-width: 0;
    max-width: none;

    position: absolute; // So that it does not affect height of the flex container
  }
`;

const StyledNoteTitle = styled(BodyRegular)`
  text-transform: uppercase;
  font-size: 12px;
`;

type TextAreaProps = {
  noteHeight: number;
  footerHeight: number;
};

// These two are intentionally styled the same so that editing is seamless
const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)<TextAreaProps>`
  border: none;

  padding-bottom: ${({ footerHeight }) => footerHeight}px;

  textarea {
    min-height: 100px;
    // height: 100%;

    ${({ noteHeight }) => `min-height: ${noteHeight}px`};

    margin: 0;
    padding: 0;
    line-height: 20px;
    font-size: 14px;
    letter-spacing: 0.4px;
    display: block;
    // border-bottom: 14px solid white;

    border-bottom: none;
    background: none;
  }

  p {
    right: 8px;
    bottom: ${({ footerHeight }) => footerHeight}px;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)<TextAreaProps>`
  white-space: pre-line;
  height: 100%;
  line-height: 20px;
  font-size: 14px;
  letter-spacing: 0.4px;

  padding-bottom: ${({ footerHeight }) => footerHeight / 2}px;

  p:last-of-type {
    margin-bottom: 40px; /* line-height * 2, because textarea leaves one line at bottom + char count */
  }

  @media only screen and ${breakpoints.tablet} {
    min-height: 150px;
  }
`;

export default NftDetailNote;
