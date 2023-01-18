import { GetServerSideProps } from 'next';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { GalleryEditor } from '~/components/GalleryEditor/GalleryEditor';
import { GalleryEditorProvider } from '~/components/GalleryEditor/GalleryEditorContext';
import { editGalleryOnboardingQuery } from '~/generated/editGalleryOnboardingQuery.graphql';

type Props = {
  galleryId: string;
};

export default function EditGallery({ galleryId }: Props) {
  const query = useLazyLoadQuery<editGalleryOnboardingQuery>(
    graphql`
      query editGalleryOnboardingQuery($galleryId: DBID!) {
        ...GalleryEditorFragment
        ...GalleryEditorContextFragment
      }
    `,
    { galleryId }
  );

  return (
    <GalleryEditorProvider queryRef={query}>
      <GalleryEditor queryRef={query} />
    </GalleryEditorProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  if (!query.galleryId || typeof query.galleryId !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      galleryId: query.galleryId,
    },
  };
};
