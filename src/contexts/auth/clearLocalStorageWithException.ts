// Clears localStorage except for designated keys
export default function clearLocalStorageWithException(exceptionKeys: string[]) {
  const valuesToKeep = [...exceptionKeys].map((key) => [key, localStorage.getItem(key)]);

  localStorage.clear();

  for (const [key, value] of valuesToKeep) {
    if (key && value) {
      localStorage.setItem(key, value);
    }
  }
}
