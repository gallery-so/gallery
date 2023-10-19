import { ReactNode } from 'react';

import { GalleryTextElementParserMentionsFragment$data } from '~/generated/GalleryTextElementParserMentionsFragment.graphql';

type TextElement = React.ComponentType<{ children: ReactNode }>;
type MentionElement = React.ComponentType<{
  mention: string;
  mentionData: GalleryTextElementParserMentionsFragment$data['entity'];
}>;
type LinkElement = React.ComponentType<{ url: string; value?: string }>;

type BreakElement = React.ComponentType<{}>;

export type SupportedProcessedTextElements = {
  BreakComponent: BreakElement;
  TextComponent: TextElement;
  MentionComponent: MentionElement;
  LinkComponent: LinkElement;
};
