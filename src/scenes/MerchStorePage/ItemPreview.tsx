import { useCallback } from 'react';
import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import { TitleXSBold, BaseM } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import SingleItemPage from './SingleItemPage';
import FlippingImage from './FlippingImage';
import colors from 'components/core/colors';

export default function ItemPreview({
  label,
  image,
  title,
  description,
  price,
}: {
  label: string;
  image: string;
  title: string;
  description: string;
  price: string;
}) {
  const { showModal } = useModalActions();
  const handleClick = useCallback(() => {
    showModal({
      content: (
        <SingleItemPage
          label={label}
          image={image}
          title={title}
          description={description}
          price={price}
        />
      ),
      isFullPage: true,
    });
  }, [showModal, label, image, title, description, price]);

  return (
    <StyledItemPreview onClick={handleClick}>
      <StyledImageContainer>
        <FlippingImage src={image} />
      </StyledImageContainer>
      <StyledBottomText>
        <StyledItemText>{title}</StyledItemText>
        <StyledSlash>/</StyledSlash>
        <StyledPurchaseText>Purchase</StyledPurchaseText>
      </StyledBottomText>
    </StyledItemPreview>
  );
}

const StyledItemPreview = styled.div`
  flex: 1;
  height: 100%;
  border: 1px solid black;
  aspect-ratio: 1;
  min-width: 200px;
  width: 100%;
  max-width: 460px;
  border-bottom: 1px solid transparent;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  @media only screen and ${breakpoints.tablet} {
    border-bottom: 1px solid black;
    &:not(:last-child) {
      border-right: 1px solid transparent;
    }
  }
`;

const StyledImageContainer = styled.div`
  height: 66.67%;
  width: 66.67%;
  position: relative;
`;

const StyledBottomText = styled.div`
  position: absolute;
  bottom: 12px;
  left: 0;
  text-align: center;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 0px 8px;
  display: flex;
`;

const StyledItemText = styled(TitleXSBold)`
  font-family: ABC Diatype; /* FIXME: Figma has ABC Diatype Mono; this is not used anywhere else in the codebase */
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: -0.01em;
  letter-spacing: -1%;
`;

const StyledSlash = styled(TitleXSBold)`
  font-family: ABC Diatype; /* FIXME: Figma has ABC Diatype Mono; this is not used anywhere else in the codebase */
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: -0.01em;
  text-align: left;
  margin: 0 12px;
`;

const StyledPurchaseText = styled(BaseM)`
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  text-decoration: underline;
  color: ${colors.shadow};
`;
