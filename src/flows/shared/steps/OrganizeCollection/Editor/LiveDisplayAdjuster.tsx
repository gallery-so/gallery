import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import VideoIcon from 'src/icons/VideoDisabled';
import styled from 'styled-components';

function DisplayAdjuster() {
  return (
    <StyledDisplayAdjuster>
      <StyledTopText>
        <StyledIconAndTextContainer>
          <VideoIcon />
          <Spacer width={8} />
          <BaseM>Live display</BaseM>
        </StyledIconAndTextContainer>
        <Spacer width={24} />
        <input type="checkbox" />
      </StyledTopText>
      <StyledBaseS>Auto-play video and interactive formats. May impact load time.</StyledBaseS>
    </StyledDisplayAdjuster>
  );
}

const StyledDisplayAdjuster = styled.div``;

const StyledTopText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const StyledIconAndTextContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledBaseS = styled(BaseS)`
  color: ${colors.metal};
`;

export default DisplayAdjuster;
