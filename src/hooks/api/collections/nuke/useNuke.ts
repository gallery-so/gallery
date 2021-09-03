import useGet from 'hooks/api/_rest/useGet';

type NukeResponse =
  | {
      success: boolean;
    }
  | {
      error: string;
    };

const nukeAction = 'nuke database';

export default function useNuke() {
  const data = useGet<NukeResponse>('/nuke', nukeAction);
  return data;
}
