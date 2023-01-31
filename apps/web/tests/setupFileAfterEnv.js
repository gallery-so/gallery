import '@testing-library/jest-dom';
import 'whatwg-fetch';

jest.mock('next/router', () => require('next-router-mock'));

class FontFace {
  constructor(name, path) {
    this.name = name;
    this.path = path;
  }
  load() {
    return Promise.resolve();
  }
}

window.FontFace = FontFace;
