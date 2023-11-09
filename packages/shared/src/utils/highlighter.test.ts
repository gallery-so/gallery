import {
  getHighlightedDescription,
  getHighlightedName,
  MAX_DISPLAYED_DESCRIPTION_CHARS,
} from './highlighter';

describe('getHighlightedName', () => {
  it('should return the text as is when keyword is empty', () => {
    const result = getHighlightedName('Hello, world!', '');
    expect(result).toBe('Hello, world!');
  });

  it('should highlight the keyword case-insensitively', () => {
    const result = getHighlightedName('Hello, world!', 'world');
    expect(result).toBe('Hello, **world**!');
  });

  it('should highlight all instances of the keyword', () => {
    const result = getHighlightedName('Hello, world! This world is amazing.', 'world');
    expect(result).toBe('Hello, **world**! This **world** is amazing.');
  });

  it('should handle @mention tags', () => {
    const result = getHighlightedName('Hello, world! This world is amazing.', '@world');
    expect(result).toBe('Hello, **world**! This **world** is amazing.');
  });
});

describe('getHighlightedDescription', () => {
  it('should return truncated description when keyword is empty', () => {
    const text = 'A'.repeat(MAX_DISPLAYED_DESCRIPTION_CHARS + 10);
    const result = getHighlightedDescription(text, '');
    expect(result).toBe('A'.repeat(MAX_DISPLAYED_DESCRIPTION_CHARS));
  });

  it('should highlight the keyword case-insensitively and return truncated description', () => {
    const result = getHighlightedDescription('Hello, world!', 'world');
    expect(result).toBe('Hello, **world**!');
  });

  it('should highlight all instances of the keyword', () => {
    const result = getHighlightedDescription('Hello, world! This world is amazing.', 'world');
    expect(result).toBe('Hello, **world**! This **world** is amazing.');
  });

  it('should prefix with ... when keyword is found at the end and text exceeds MAX_DISPLAYED_DESCRIPTION_CHARS', () => {
    const text = 'A'.repeat(MAX_DISPLAYED_DESCRIPTION_CHARS - 5) + 'world';
    const result = getHighlightedDescription(text, 'world');
    expect(result).toBe('...' + 'A'.repeat(MAX_DISPLAYED_DESCRIPTION_CHARS - 5) + '**world**');
  });
});
