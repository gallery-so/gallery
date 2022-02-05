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
import { pause } from 'utils/time';
import { GLOBAL_FOOTER_HEIGHT } from 'components/core/Page/constants';

const MAX_CHAR_COUNT = 400;

type Props = {
  nftCollectorsNote?: string;
  nftId: string;
  userOwnsAsset: boolean;
};

function NftDetailNote({ nftCollectorsNote, nftId, userOwnsAsset }: Props) {
  // Generic error that doesn't belong to collector's note
  const [generalError, setGeneralError] = useState('');

  const [isEditing, setIsEditing] = useState(false);

  const unescapedCollectorsNote = useMemo(() => unescape(nftCollectorsNote), [nftCollectorsNote]);
  const [collectorsNote, setCollectorsNote] = useState(unescapedCollectorsNote ?? '');

  const hasCollectorsNote = useMemo(() => collectorsNote.length > 0, [collectorsNote]);

  const collectorsNoteRef = useRef<HTMLDivElement>(null);

  const handleEditCollectorsNote = useCallback(() => {
    setIsEditing(true);

    // Scroll down - wait 50ms so that element exists before scrolling to bottom of it
    setTimeout(() => {
      if (collectorsNoteRef.current) {
        collectorsNoteRef.current.scrollIntoView({
          block: 'end',
          inline: 'nearest',
          behavior: 'smooth',
        });
      }
    }, 50);
  }, []);

  const updateNft = useUpdateNft();

  const handleSubmitCollectorsNote = useCallback(async () => {
    // Scroll back up
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    // Then save, etc.
    await pause(500);

    setGeneralError('');
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
  }, []);

  return (
    <StyledContainer
      footerHeight={GLOBAL_FOOTER_HEIGHT}
      isEditing={isEditing}
      ref={collectorsNoteRef}
    >
      <Spacer height={18} />

      {userOwnsAsset ? (
        <TextButton
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

type ContainerProps = {
  footerHeight: number;
  isEditing: boolean;
};

const StyledContainer = styled.div<ContainerProps>`
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
    padding-bottom: ${({ footerHeight }) => footerHeight}px;
  }
`;

const StyledNoteTitle = styled(BodyRegular)`
  text-transform: uppercase;
  font-size: 12px;
`;

// The two elements below are intentionally styled the same so that editing appears inline
const StyledTextAreaWithCharCount = styled(TextAreaWithCharCount)`
  border: none;

  textarea {
    min-height: 200px;
    height: 100%;
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
    bottom: 0;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  min-height: 44px;
  height: 100%;
  line-height: 20px;
  font-size: 14px;
  letter-spacing: 0.4px;
`;

export default NftDetailNote;
