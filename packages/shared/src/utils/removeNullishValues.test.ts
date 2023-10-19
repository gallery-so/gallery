import { removeNullishValues } from './removeNullishValues';

// thank you ChatGPT
describe('removeNullishValues', () => {
  it('should remove properties with null values', () => {
    const input = {
      a: 'apple',
      b: null,
    };
    const output = removeNullishValues(input);
    expect(output).toEqual({ a: 'apple' });
  });

  it('should remove properties with undefined values', () => {
    const input = {
      a: 'apple',
      b: undefined,
    };
    const output = removeNullishValues(input);
    expect(output).toEqual({ a: 'apple' });
  });

  it('should keep properties with other falsy values', () => {
    const input = {
      a: 'apple',
      b: 0,
      c: false,
      d: '',
    };
    const output = removeNullishValues(input);
    expect(output).toEqual({
      a: 'apple',
      b: 0,
      c: false,
      d: '',
    });
  });

  it('should return an empty object if all properties are null or undefined', () => {
    const input = {
      a: null,
      b: undefined,
    };
    const output = removeNullishValues(input);
    expect(output).toEqual({});
  });

  it('should return the same object if there are no null or undefined properties', () => {
    const input = {
      a: 'apple',
      b: 42,
    };
    const output = removeNullishValues(input);
    expect(output).toEqual(input);
  });
});
