import { useCallback, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { BaseM, BlueLabel, TitleMonoM } from '~/components/core/Text/Text';
import EthereumProviders from '~/contexts/auth/EthereumProviders';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useMintMerchContract } from '~/hooks/useContract';
import useMintContractWithQuantity from '~/hooks/useMintContractWithQuantity';
import colors from '~/shared/theme/colors';

import FlippingImage from './FlippingImage';
import SingleItemPage from './SingleItemPage';

export default function ItemPreview({
  label,
  image,
  title,
  description,
  tokenId,
  quantity,
}: {
  label: string;
  image: string;
  title: string;
  description: string;
  tokenId: number;
  quantity: number;
}) {
  const { showModal } = useModalActions();
  const handleClick = useCallback(() => {
    showModal({
      content: (
        <EthereumProviders>
          <SingleItemPage
            label={label}
            image={image}
            title={title}
            description={description}
            tokenId={tokenId}
          />
        </EthereumProviders>
      ),
      isFullPage: true,
    });
  }, [showModal, label, image, title, description, tokenId]);

  const contract = useMintMerchContract();

  const { soldOut } = useMintContractWithQuantity({
    contract,
    tokenId,
  });

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <StyledItemPreview
      onClick={handleClick}
      onMouseOver={() => setIsFlipped(true)}
      onMouseOut={() => setIsFlipped(false)}
    >
      <StyledImageContainer>
        <FlippingImage src={image} isInPreview isFlipped={isFlipped} />
      </StyledImageContainer>
      <StyledTopRightLabels>
        {quantity > 0 && <StyledOwnedText>You Own {quantity}</StyledOwnedText>}
        {soldOut && <StyledSoldOutText>Sold Out</StyledSoldOutText>}
      </StyledTopRightLabels>
      <StyledBottomText>
        <StyledItemText>{title}</StyledItemText>

        {!soldOut && (
          <>
            <StyledSlash>/</StyledSlash>
            <StyledPurchaseText>Purchase</StyledPurchaseText>
          </>
        )}
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
  max-width: 420px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  &:not(:last-child) {
    border-bottom: 1px solid transparent;
  }

  @media only screen and ${breakpoints.tablet} {
    &:not(:last-child) {
      border-bottom: 1px solid black;
      border-right: 1px solid transparent;
    }
  }
`;

const StyledImageContainer = styled.div<{ isCard?: boolean }>`
  height: 66.67%;
  width: 66.67%;
  position: relative;
`;

const StyledBottomText = styled.div`
  position: absolute;
  bottom: 14px;
  left: 0;
  text-align: center;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 0px 8px;
  display: flex;
`;

const StyledItemText = styled(TitleMonoM)``;

const StyledSlash = styled(TitleMonoM)`
  margin: 0 12px;
`;

const StyledPurchaseText = styled(BaseM)`
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  text-decoration: underline;
  color: ${colors.shadow};
`;

const StyledTopRightLabels = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
`;

const StyledSoldOutText = styled(BlueLabel)`
  color: ${colors.black['800']};
  border-color: ${colors.black['800']};
`;

const StyledOwnedText = styled(BlueLabel)``;
