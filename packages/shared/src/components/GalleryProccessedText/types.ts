import { ReactNode } from 'react';

import { GalleryTextElementParserMentionsFragment$data } from '~/generated/GalleryTextElementParserMentionsFragment.graphql';

type TextElement = React.ComponentType<{ children: ReactNode }>;
type MentionElement = React.ComponentType<{
  mention: string;
  mentionData: GalleryTextElementParserMentionsFragment$data['entity'];
}>;
type LinkElement = React.ComponentType<{ url: string; value?: string }>;

export type SupportedProcessedTextElements = {
  TextComponent: TextElement;
  MentionComponent: MentionElement;
  LinkComponent: LinkElement;
};
