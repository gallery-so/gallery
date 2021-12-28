export default function sanitizePathname(string_: string) {
  return (
    string_
      // remove redundant slash: //a///b//c => /a/b/c
      .replace(/([^:]\/)\/+/g, '$1')
      // remove trailing slash: /bingbong/ => /bingbong
      .replace(/\/+$/, '')
  );
}
