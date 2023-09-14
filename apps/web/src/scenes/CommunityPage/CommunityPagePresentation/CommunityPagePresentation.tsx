import GalleryLogoNoBrackets from 'public/icons/gallery_logo_no_brackets.svg';
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

import CommunityPagePresentationPosts from '../CommunityPagePresentationPosts';

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
    <StyledPresentation>
      <VStack align="center" gap={54}>
        <HStack gap={28} align="center">
          <GalleryLogoNoBrackets />
          <CloseIcon size={35} />
          <ProhibitionLogo />
        </HStack>
        <HStack align="center" gap={94}>
          <LogoBracketLeft width={75} height={252} />
          <StyledArtistName>Jimena Buena Vida</StyledArtistName>
          <LogoBracketRight width={75} height={252} />
        </HStack>
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

const StyledArtistName = styled(TitleM)`
  font-size: 200px;
  line-height: 190px;
  letter-spacing: -0.03em;
`;
