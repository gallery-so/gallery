// Types that represent the content models in our CMS. These should be manually updated whenever we update the CMS model schema.

interface Block {
  _type: 'block';
  style: string;
  list: string;
  children: { _key: string; _type: 'span'; text: string; marks: string[] }[];
}

interface Image {
  _type: 'image';
  asset: {
    url: string;
  };
  alt: string;
}

interface Media {
  _type: 'media';
  mediaType: 'image' | 'video';
  image: Image;
  video: Video;
  alt: string;
}

interface Video {
  _type: 'video';
  asset: {
    url: string;
  };
}

export namespace CmsTypes {
  export interface Faq {
    _type: 'faq';
    question: string;
    answer: string;
  }

  export interface FaqModule {
    _type: 'faqModule';
    title: string;
    faqs: Faq[];
  }

  export interface FeatureHighlight {
    _type: 'featureHighlight';
    heading: string;
    body: Block[];
    media: Media;
    orientation: 'left' | 'right';
  }

  export interface FeaturePage {
    _type: 'featurePage';
    id: string;
    title: string;
    introText: string;
    splashImage: Image;
    featureHighlights: FeatureHighlight[];
    faqModule: FaqModule;
    externalLink: string;
  }
}
