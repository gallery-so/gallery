import { useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FarcasterIcon from '~/icons/FarcasterIcon';
import LensIcon from '~/icons/LensIcon';
import TwitterIcon from '~/icons/TwitterIcon';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../cms_types';

type TestimonialsProps = {
  testimonials: CmsTypes.Testimonial[];
};

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <StyledTestimonials>
      {testimonials.map((testimonial) => (
        <Testimonial key={testimonial.id} testimonial={testimonial} />
      ))}
    </StyledTestimonials>
  );
}

const StyledTestimonials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px 24px;

  @media only screen and ${breakpoints.tablet} {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and ${breakpoints.desktop} {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
`;

type TestimonialProps = {
  testimonial: CmsTypes.Testimonial;
};

function Testimonial({ testimonial }: TestimonialProps) {
  const platformIcon = useMemo(() => {
    switch (testimonial.platformIcon) {
      case 'twitter':
        return <TwitterIcon fill={colors.metal} />;
      case 'lens':
        return <LensIcon fill={colors.metal} />;
      case 'farcaster':
        return <FarcasterIcon fill={colors.metal} />;
      default:
        return null;
    }
  }, [testimonial.platformIcon]);

  return (
    <StyledTestimonial gap={12}>
      <HStack justify="space-between">
        <HStack gap={6}>
          <StyledUsername>{testimonial.username}</StyledUsername>
          <StyledSecondaryText>@{testimonial.handle}</StyledSecondaryText>
          <StyledSecondaryText>{testimonial.date}</StyledSecondaryText>
        </HStack>
        {platformIcon}
      </HStack>
      <StyledCaption>{testimonial.caption}</StyledCaption>
    </StyledTestimonial>
  );
}

const StyledTestimonial = styled(VStack)`
  background-color: ${colors.faint};
  padding: 24px 32px;
  border-radius: 12px;
`;

const StyledUsername = styled(BaseM)`
  font-weight: 600;
  font-size: 18px;
`;

const StyledSecondaryText = styled(BaseM)`
  color: ${colors.metal};
`;
const StyledCaption = styled(BaseM)`
  font-size: 16px;
`;
