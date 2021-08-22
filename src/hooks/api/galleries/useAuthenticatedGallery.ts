import { Gallery } from 'types/Gallery';
import { User } from 'types/User';
import { useAuthenticatedUser } from '../users/useUser';
import useGalleries from './useGalleries';

export default function useAuthenticatedGallery(): Gallery {
  const user = useAuthenticatedUser() as User;
  if (!user) {
    throw new Error('Authenticated user not found');
  }

  const galleries = useGalleries({ userId: user.id });
  if (!galleries?.length) {
    throw new Error("Authenticated user doesn't have any galleries!");
  }

  return galleries[0];
}
