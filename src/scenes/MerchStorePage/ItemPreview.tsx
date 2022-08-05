import { useCallback } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';
import { Button } from 'components/core/Button/Button';
import { TitleXSBold } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import SingleItemPage from './SingleItemPage';

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
    <StyledItemPreview>
      <StyledImageContainer>
        <Image src={image} layout="fill" />
      </StyledImageContainer>
      <StyledBottomText>
        <StyledItemText>{title}</StyledItemText>
        <StyledBuyButton onClick={handleClick}>Buy Now</StyledBuyButton>
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
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  place-items: center;
  padding: 0px 8px;
`;

const StyledItemText = styled(TitleXSBold)`
  text-transform: uppercase;
`;

const StyledBuyButton = styled(Button)`
  margin-bottom: 8px;
`;
