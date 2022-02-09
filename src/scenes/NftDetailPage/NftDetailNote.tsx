import { BodyRegular } from 'components/core/Text/Text';
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
const MIN_NOTE_HEIGHT = 150;

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

  const scrollDown = () => {
    if (collectorsNoteRef.current) {
      collectorsNoteRef.current.scrollIntoView({
        block: 'end',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  const handleEditCollectorsNote = useCallback(() => {
    setIsEditing(true);

    // TODO Expand note to full height first time it is opened
    // Currently user has to type first to expand it fully

    // Scroll down - wait 100ms so that element exists before scrolling to bottom of it
    setTimeout(() => {
      scrollDown();
    }, 200);
  }, []);

  const updateNft = useUpdateNft();

  const handleSubmitCollectorsNote = useCallback(async () => {
    setGeneralError('');

    if (unescapedCollectorsNote.length > MAX_CHAR_COUNT) {
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
  }, [updateNft, nftId, collectorsNote, unescapedCollectorsNote]);

  // If the user hits cmd + ctrl enter, submit the note
  const handleKeyDown = useCallback(
    async (event) => {
      if (event.key === 'Enter' && event.metaKey) {
        event.preventDefault();
        await handleSubmitCollectorsNote();
      }
    },
    [handleSubmitCollectorsNote]
  );

  const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCollectorsNote(event.target?.value);
    setNoteHeight(event.target?.scrollHeight);

    // On clear, reset note height (textarea scrollHeight does not decrease on its own, it only increases)
    // So we use this hard reset if the user deletes all content. Could have more elegant solution
    // TODO Reduce size to text content on any delete
    if (event.target?.value === '') {
      setNoteHeight(MIN_NOTE_HEIGHT);
    }

    // Scroll down as the user input goes off the screen
    // Need setTimeout so that textarea height is updated
    setTimeout(() => {
      scrollDown();
    }, 50);
  }, []);

  return (
    <StyledContainer ref={collectorsNoteRef} tabIndex={0} onKeyDown={handleKeyDown}>
      <Spacer height={18} />

      <StyledTitleAndButtonContainer>
        {(hasCollectorsNote || isEditing) && <BodyRegular>Collector&rsquo;s Note</BodyRegular>}
        {userOwnsAsset && !hasCollectorsNote && !isEditing && (
          <TextButton text={`+ Add Collector's Note`} onClick={handleEditCollectorsNote} />
        )}
        {userOwnsAsset && (isEditing || hasCollectorsNote) && (
          <TextButton
            disabled={unescapedCollectorsNote.length > MAX_CHAR_COUNT && isEditing}
            text={isEditing ? `Save` : `Edit`}
            onClick={isEditing ? handleSubmitCollectorsNote : handleEditCollectorsNote}
          />
        )}
      </StyledTitleAndButtonContainer>
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={12} />
      {isEditing && (
        <StyledTextAreaWithCharCount
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          onChange={handleNoteChange}
          placeholder="Tell us about your NFT..."
          defaultValue={unescapedCollectorsNote}
          currentCharCount={unescapedCollectorsNote.length}
          maxCharCount={MAX_CHAR_COUNT}
          noteHeight={noteHeight}
        />
      )}

      {hasCollectorsNote && !isEditing && (
        <StyledCollectorsNote
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          minNoteHeight={MIN_NOTE_HEIGHT}
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

const StyledTitleAndButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 2; /* Above footer so user can click buttons on very small vertical screens */
  position: relative;
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
    ${({ noteHeight }) => `min-height: ${noteHeight}px`};

    color: #808080;
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
    right: 0;
    bottom: ${({ footerHeight }) => footerHeight}px;
  }
`;

type CollectorsNoteProps = {
  footerHeight: number;
  minNoteHeight: number;
};

const StyledCollectorsNote = styled(BodyRegular)<CollectorsNoteProps>`
  white-space: pre-line;
  height: 100%;
  line-height: 20px;
  font-size: 14px;
  letter-spacing: 0.4px;
  color: #808080;

  padding-bottom: ${({ footerHeight }) => footerHeight / 2}px;

  p:last-of-type {
    margin-bottom: 40px; /* line-height * 2, because textarea leaves one line at bottom + char count */
  }

  @media only screen and ${breakpoints.tablet} {
    min-height: ${({ minNoteHeight }) => minNoteHeight}px;
  }
`;

export default NftDetailNote;
