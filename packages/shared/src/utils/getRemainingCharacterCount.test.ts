import {
  getRemainingCharacterCount,
  MAX_COLLECTION_DESCRIPTION_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_POST_LENGTH,
} from './getRemainingCharacterCount';

describe('getRemainingCharacterCount', () => {
  it('should return the correct remaining character count', () => {
    const message = 'Hello, this is a test message with a url https://example.com';
    const remaining = getRemainingCharacterCount(message, MAX_COMMENT_LENGTH);
    expect(remaining).toBe(257);
  });

  it('should handle messages with multiple URLs', () => {
    const message =
      'Hello, this is a test message with multiple urls https://example1.com and https://example2.com';
    const remaining = getRemainingCharacterCount(message, MAX_COMMENT_LENGTH);
    expect(remaining).toBe(242);
  });

  it('should handle messages without URLs', () => {
    const message = 'Hello, this is a test message without a url';
    const remaining = getRemainingCharacterCount(message, MAX_POST_LENGTH);
    const expectedRemaining = MAX_POST_LENGTH - message.length;
    expect(remaining).toBe(expectedRemaining);
  });

  it('should handle empty messages', () => {
    const message = '';
    const remaining = getRemainingCharacterCount(message, MAX_COLLECTION_DESCRIPTION_LENGTH);
    expect(remaining).toBe(MAX_COLLECTION_DESCRIPTION_LENGTH);
  });
});
