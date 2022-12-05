export default class Page {
  acceptMetamaskAccessRequest() {
    // cy.wait(1000);
    // cy.acceptMetamaskAccess(false).should('be.true');
    // cy.switchToCypressWindow();
    // cy.wait(1000);
    cy.acceptMetamaskAccess().then((connected) => {
      expect(connected).to.be.true;
      cy.confirmMetamaskSignatureRequest();
    });
  }
}
