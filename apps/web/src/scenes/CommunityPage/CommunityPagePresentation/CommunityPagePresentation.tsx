import GalleryLogoNoBrackets from 'public/icons/gallery_logo_no_brackets.svg';
import ProhibitionLogo from 'public/icons/prohibition_logo.svg';
import { Suspense, useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';
import { ITEMS_PER_PAGE } from '~/components/Feed/constants';
import { CommunityPagePresentationFragment$key } from '~/generated/CommunityPagePresentationFragment.graphql';
import { RefetchableCommunityPresentationFeedQuery } from '~/generated/RefetchableCommunityPresentationFeedQuery.graphql';
import CloseIcon from '~/icons/CloseIcon';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';

import CommunityPagePresentationPosts from '../CommunityPagePresentationPosts';
import CommunityPagePostCycle from './CommunityPagePresentationPostsCycle';

type Props = {
  communityRef: CommunityPagePresentationFragment$key;
  queryRef: CommunityPagePresentationFragment$key;
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

  const postData = useMemo(() => {
    const events = [];

    for (const edge of community.presentationPosts?.edges ?? []) {
      if (edge?.node?.__typename === 'Post' && edge.node) {
        events.push(edge.node);
      }
    }

    return events;
  }, [community.presentationPosts?.edges]);

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
        {/* <CommunityPagePostCycle
          postRefs={postData}
          queryRef={query}
          loadNext={loadNext}
          hasNext={hasNext}
          checkForNextPage={checkForNextPage}
          refetch={refetch}
        /> */}
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
  // font-family: 'GT Alpina', serif;
  font-size: 200px;
  line-height: 190px;
  letter-spacing: -0.03em;
`;
