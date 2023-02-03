// hackily handle very specific cases where we display usernames in the app.
// in the future, we'll add a `display_name` field to the user model that's separate from `username`
export default function handleCustomDisplayName(username: string) {
  const lowered = username.toLowerCase();
  if (lowered === '3ac') return 'The Unofficial 3AC Gallery';
  if (lowered === 'loyd') return 'Løyd';
  return username;
}
