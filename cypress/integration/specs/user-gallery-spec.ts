describe('user gallery tests', () => {
  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('should render the static collection', () => {
    cy.visit('/percyio/26SbJpukOE3AIJuo9JsWGBA6Xk1');
    cy.wait(3000);
    cy.percySnapshot('user gallery: static collection');
  });

  it('should render the first live collection', () => {
    cy.visit('/percyio/26SbJpukOE3AIJuo9JsWGBA6Xk2');
    cy.wait(3000);
    cy.percySnapshot('user gallery: live collection 1');
  });

  it('should render the second live collection', () => {
    cy.visit('/percyio/2EmOPrTDsAibEvPP8Hn3wCkIrle');
    cy.wait(3000);
    cy.percySnapshot('user gallery: live collection 2');
  });

  it('should render the third live collection', () => {
    cy.visit('/percyio/2EmOUGtyR0O85qUwwnWurfRopYq');
    cy.wait(3000);
    cy.percySnapshot('user gallery: live collection 3');
  });

  it('should render the fourth live collection', () => {
    cy.visit('/percyio/2EmOcXKDs660QTUSTPHuo7JOHaT');
    cy.wait(3000);
    cy.percySnapshot('user gallery: live collection 4');
  });
});
