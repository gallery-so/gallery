const HASH = -1_695_594_350;

// Basic hash function used to validate user entered password
// it is ok if users figure out the pw -
// this validation is clientside only and exists to manage
// the # of new account creations while we grow

function generateHash(string: string) {
  let hash = 0;
  if (string.length === 0) {
    return hash;
  }

  for (let i = 0; i < string.length; i++) {
    const charCode = string.charCodeAt(i);
    hash = (hash << 7) - hash + charCode;
    hash &= hash;
  }

  return hash;
}

export function validatePassword(password: string): boolean {
  return generateHash(password) === HASH;
}
