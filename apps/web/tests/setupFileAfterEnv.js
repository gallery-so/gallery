import '@testing-library/jest-dom';

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
