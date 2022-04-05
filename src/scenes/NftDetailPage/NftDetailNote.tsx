import { BaseM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import TextButton from 'components/core/Button/TextButton';
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { AutoResizingTextAreaWithCharCount } from 'components/core/TextArea/TextArea';
import unescape from 'lodash.unescape';
import styled from 'styled-components';
import useUpdateNft from 'hooks/api/nfts/useUpdateNft';
import Markdown from 'components/core/Markdown/Markdown';
import breakpoints from 'components/core/breakpoints';
import ErrorText from 'components/core/Text/ErrorText';
import formatError from 'errors/formatError';
import { GLOBAL_FOOTER_HEIGHT } from 'components/core/Page/constants';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

const MAX_CHAR_COUNT = 1200;

type NoteEditorProps = {
  nftCollectorsNote: string;
  nftId: string;
};

function NoteEditor({ nftCollectorsNote, nftId }: NoteEditorProps) {
  // Generic error that doesn't belong to collector's note
  const [generalError, setGeneralError] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  const [noteHeight, setNoteHeight] = useState(0);

  const [collectorsNote, setCollectorsNote] = useState(nftCollectorsNote ?? '');
  const unescapedCollectorsNote = useMemo(() => unescape(collectorsNote), [collectorsNote]);

  const hasCollectorsNote = useMemo(() => collectorsNote.length > 0, [collectorsNote]);

  const collectorsNoteRef = useRef<HTMLDivElement>(null);

  // We need to record the note height to prevent brief flashes between edit/save states, via StyledHeightBuffer
  useEffect(() => {
    if (collectorsNoteRef.current) {
      setNoteHeight(collectorsNoteRef.current.scrollHeight);
    }
  }, [collectorsNote]);

  const scrollDown = useCallback(() => {
    if (collectorsNoteRef.current) {
      collectorsNoteRef.current.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }, []);

  const handleEditCollectorsNote = useCallback(() => {
    setIsEditing(true);

    // Scroll down - wait so that element exists before scrolling to bottom of it
    setTimeout(() => {
      scrollDown();
    }, 200);
  }, [scrollDown]);

  const updateNft = useUpdateNft();

  const track = useTrack();

  const handleSubmitCollectorsNote = useCallback(async () => {
    setGeneralError('');

    if (unescapedCollectorsNote.length > MAX_CHAR_COUNT) {
      // No need to handle error here, since the form will mark the text as red
      return;
    }

    setIsEditing(false);

    try {
      await updateNft(nftId, collectorsNote);
      track('Save NFT collectors note', {
        added_note: unescapedCollectorsNote.length > 0,
        num_chars: unescapedCollectorsNote.length,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setGeneralError(formatError(error));
      }
    }
  }, [updateNft, nftId, collectorsNote, unescapedCollectorsNote, track]);

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

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCollectorsNote(event.target?.value);

      // Scroll down as the user input goes off the screen
      // Need setTimeout so that textarea height is updated
      setTimeout(() => {
        scrollDown();
      }, 0);
    },
    [scrollDown]
  );

  return (
    <div onKeyDown={handleKeyDown} ref={collectorsNoteRef}>
      <StyledTitleAndButtonContainer>
        {/* We also include isEditing as an option here so the user can click save with an empty note (e.g. delete their note) */}
        {hasCollectorsNote || isEditing ? (
          <>
            <BaseM>Collector&rsquo;s Note</BaseM>
            {isEditing ? (
              <TextButton
                disabled={unescapedCollectorsNote.length > MAX_CHAR_COUNT}
                text="Save"
                onClick={handleSubmitCollectorsNote}
              />
            ) : (
              <TextButton text="Edit" onClick={handleEditCollectorsNote} />
            )}
          </>
        ) : (
          <TextButton text={"+ Add Collector's Note"} onClick={handleEditCollectorsNote} />
        )}
      </StyledTitleAndButtonContainer>

      {/* Without StyledHeightBuffer, when the page switches between StyledTextAreaWithCharCount and StyledCollectorsNote, there would be a brief flash when there is no element on the page*/}
      <StyledHeightBuffer noteHeight={noteHeight} />
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}

      <Spacer height={8} />

      {/* Create a dummy textbox of the same height so that, when the element switches from the above to this one, there is not a jump to the top of the screen before scrollDown applies */}
      {isEditing ? (
        <StyledTextAreaWithCharCount
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          onChange={handleNoteChange}
          placeholder="Tell us about your NFT..."
          defaultValue={unescapedCollectorsNote}
          currentCharCount={unescapedCollectorsNote.length}
          maxCharCount={MAX_CHAR_COUNT}
        />
      ) : (
        <StyledCollectorsNote
          footerHeight={GLOBAL_FOOTER_HEIGHT}
          onDoubleClick={handleEditCollectorsNote}
        >
          <Markdown text={collectorsNote} />
        </StyledCollectorsNote>
      )}
    </div>
  );
}

type NoteViewerProps = {
  nftCollectorsNote: string;
};

function NoteViewer({ nftCollectorsNote }: NoteViewerProps) {
  return (
    <>
      <BaseM>Collector&rsquo;s Note</BaseM>
      <Spacer height={8} />
      <StyledCollectorsNote footerHeight={GLOBAL_FOOTER_HEIGHT}>
        <Markdown text={nftCollectorsNote} />
      </StyledCollectorsNote>
    </>
  );
}

type Props = {
  nftCollectorsNote: string;
  nftId: string;
  authenticatedUserOwnsAsset: boolean;
};

function NftDetailNote({ nftCollectorsNote, nftId, authenticatedUserOwnsAsset }: Props) {
  return (
    <StyledContainer>
      <Spacer height={24} />
      {authenticatedUserOwnsAsset ? (
        <NoteEditor nftCollectorsNote={nftCollectorsNote} nftId={nftId} />
      ) : (
        <NoteViewer nftCollectorsNote={nftCollectorsNote} />
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
  footerHeight: number;
};

// These two are intentionally styled the same so that editing is seamless
const StyledTextAreaWithCharCount = styled(AutoResizingTextAreaWithCharCount)<TextAreaProps>`
  border: none;
  -ms-overflow-style: none;
  scrollbar-width: none;

  textarea {
    color: #808080;
    margin: 0;
    padding: 0;
    line-height: 20px;
    font-size: 14px;
    display: block;

    border-bottom: none;
    background: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  p {
    right: 0;
    bottom: 0;
  }

  // We only apply padding to account for footer, which is not fixed on mobile
  @media only screen and ${breakpoints.tablet} {
    padding-bottom: ${({ footerHeight }) => footerHeight}px;

    p {
      bottom: ${({ footerHeight }) => footerHeight}px;
    }
  }
`;

type CollectorsNoteProps = {
  footerHeight: number;
  isHidden?: boolean;
};

const StyledCollectorsNote = styled(BaseM)<CollectorsNoteProps>`
  white-space: pre-line;
  height: 100%;
  color: #808080;

  // We only apply padding to account for footer, which is not fixed on mobile
  @media only screen and ${breakpoints.tablet} {
    padding-bottom: ${({ footerHeight }) => footerHeight}px;
  }

  p:last-of-type {
    margin-bottom: 40px; /* line-height * 2, because textarea leaves one line at bottom + char count */
  }
`;

const StyledHeightBuffer = styled.div<{ noteHeight: number }>`
  height: ${({ noteHeight }) => noteHeight}px;
  width: 100%;
  position: absolute;
  z-index: -1;
`;

export default NftDetailNote;
