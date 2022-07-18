import styled from 'styled-components';
import VideoEnabledIcon from 'src/icons/Video';
import VideoDisabledIcon from 'src/icons/VideoDisabled';
import {
  useCollectionEditorActions,
  useCollectionMetadataState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useMemo } from 'react';

type Props = {
  id: string;
};

export default function LiveDisplayButton({ id }: Props) {
  const collectionMetadata = useCollectionMetadataState();
  const { setSingleTokenLiverender } = useCollectionEditorActions();

  const isEnabled = useMemo(() => {
    return collectionMetadata.tokenSettings[id];
  }, [collectionMetadata.tokenSettings, id]);

  return isEnabled ? (
    <StyledVideoDisabledIcon color="white" onClick={() => setSingleTokenLiverender(id, false)} />
  ) : (
    <StyledVideoEnabledIcon color="white" onClick={() => setSingleTokenLiverender(id, true)} />
  );
}

const StyledVideoEnabledIcon = styled(VideoEnabledIcon)`
  mix-blend-mode: exclusion;
  position: absolute;
  left: 8px;
  bottom: 8px;
  cursor: pointer;
  z-index: 11; // above the gradient
`;

const StyledVideoDisabledIcon = styled(VideoDisabledIcon)`
  mix-blend-mode: exclusion;
  position: absolute;
  left: 8px;
  bottom: 8px;
  cursor: pointer;
  z-index: 11; // above the gradient
`;
