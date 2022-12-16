import {
  autoUpdate,
  flip,
  FloatingOverlay,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import { CommentBox } from '~/components/Feed/Socialize/CommentBox/CommentBox';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommentBoxIconEventFragment$key } from '~/generated/CommentBoxIconEventFragment.graphql';
import { CommentBoxIconQueryFragment$key } from '~/generated/CommentBoxIconQueryFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { CommentIcon } from '~/icons/SocializeIcons';

type Props = {
  queryRef: CommentBoxIconQueryFragment$key;
  eventRef: CommentBoxIconEventFragment$key;
};

export function CommentBoxIcon({ queryRef, eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CommentBoxIconEventFragment on FeedEvent {
        ...CommentBoxFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentBoxIconQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              __typename
            }
          }
        }

        ...CommentBoxQueryFragment
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const [showCommentBox, setShowCommentBox] = useState(false);

  const { showModal } = useModalActions();

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        setShowCommentBox(false);

        return;
      }

      // If the user isn't logged in, show the auth modal
      if (!query.viewer?.user) {
        showModal({
          content: <AuthModal queryRef={query} />,
        });

        return;
      }

      setShowCommentBox(true);
    },
    [query, showModal]
  );

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-end',
    open: showCommentBox,
    onOpenChange: handleOpenChange,
    middleware: [offset(), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const role = useRole(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handleClose = useCallback(() => {
    setShowCommentBox(false);
  }, []);

  return (
    <>
      <CommentIcon ref={reference} {...getReferenceProps()} />

      <AnimatePresence>
        {showCommentBox && (
          <FloatingOverlay style={{ zIndex: 10 }}>
            <motion.div
              // Floating Props
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 10,
              }}
              {...getFloatingProps()}
              // Framer Motion Props
              transition={{
                duration: ANIMATED_COMPONENT_TRANSITION_S,
                ease: rawTransitions.cubicValues,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
              exit={{ opacity: 0, y: 0 }}
            >
              <CommentBox onClose={handleClose} eventRef={event} queryRef={query} />
            </motion.div>
          </FloatingOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
