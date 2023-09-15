import GalleryLogoNoBrackets from 'public/icons/gallery_logo_no_brackets.svg';
import GlitchLogo from 'public/icons/glitch_logo.svg';
import ProhibitionLogo from 'public/icons/prohibition_logo.svg';
import { Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';
import { CommunityPagePresentationFragment$key } from '~/generated/CommunityPagePresentationFragment.graphql';
import { CommunityPagePresentationQueryFragment$key } from '~/generated/CommunityPagePresentationQueryFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';

import CommunityPagePresentationPosts from './CommunityPagePresentationPosts';
import colors from '~/shared/theme/colors';

type Props = {
  communityRef: CommunityPagePresentationFragment$key;
  queryRef: CommunityPagePresentationQueryFragment$key;
};

export default function CommunityPagePresentation({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPagePresentationFragment on Community {
        ...CommunityPagePresentationPostsFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationQueryFragment on Query {
        ...CommunityPagePresentationPostsQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledPresentation gap={72}>
      <VStack align="center" gap={60}>
        <VStack align="center" gap={12}>
          <StyledTitle>Resonance</StyledTitle>
          <StyledTitle>
            <strong>Jimena Buena Vida</strong>
          </StyledTitle>
        </VStack>
        <HStack gap={28} align="center">
          <LogoBracketLeft width={22} height={75} />
          <GalleryLogoNoBrackets />
          <CloseIcon size={35} />
          <GlitchLogo />
          <CloseIcon size={35} />
          <ProhibitionLogo />
          <LogoBracketRight width={22} height={75} />
        </HStack>
      </VStack>
      <VStack align="center">
        <StyledDivider />
      </VStack>
      <Suspense fallback={null}>
        <CommunityPagePresentationPosts communityRef={community} queryRef={query} />
      </Suspense>
    </StyledPresentation>
  );
}

const StyledPresentation = styled(VStack)`
  padding: 80px 0;
  height: 100%;
`;

const StyledTitle = styled(TitleM)`
  font-size: 120px;
  line-height: 120px;
  letter-spacing: -0.03em;
`;

const StyledDivider = styled.div`
  width: 2000px;
  border-top: 1px solid ${colors.porcelain};
`;
