export default function formatError(error: Error) {
  if (error.message) {
    return `Error: ${error.message}`;
  }

  return 'Sorry, the server is currently unavailable. Please try again later or ping us on Discord.';
}
