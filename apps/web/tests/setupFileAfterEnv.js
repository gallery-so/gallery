import '@testing-library/jest-dom';

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
