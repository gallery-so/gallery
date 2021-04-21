const HASH = -1695594350;

// basic hash function used to validate user entered password
// it is ok if users figure out the pw -
// this validation is clientside only and exists to manage
// the # of new account creations while we grow

function generateHash(string: string) {
  var hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    var charCode = string.charCodeAt(i);
    hash = (hash << 7) - hash + charCode;
    hash = hash & hash;
  }
  return hash;
}

export function validatePassword(password: string) {
  return generateHash(password) === HASH;
}
