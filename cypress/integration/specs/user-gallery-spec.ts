import Page from '../pages/page';

const page = new Page();

describe('user gallery tests', () => {
  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('should render the static collection', () => {
    page.screenshotPageAcrossDevices('/percyio/26SbJpukOE3AIJuo9JsWGBA6Xk1');
  });

  it('should render the first live collection', () => {
    page.screenshotPageAcrossDevices('/percyio/26SbJpukOE3AIJuo9JsWGBA6Xk2');
  });

  //   it('should render the second live collection', () => {
  //     page.screenshotPageAcrossDevices('/percyio/2EmOPrTDsAibEvPP8Hn3wCkIrle');
  //   });

  //   it('should render the third live collection', () => {
  //     page.screenshotPageAcrossDevices('/percyio/2EmOUGtyR0O85qUwwnWurfRopYq');
  //   });

  it('should render the fourth live collection', () => {
    page.screenshotPageAcrossDevices('/percyio/2EmOcXKDs660QTUSTPHuo7JOHaT');
  });
});
