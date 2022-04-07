export default class Page {
  acceptMetamaskAccessRequest() {
    cy.wait(1000);
    cy.acceptMetamaskAccess(false);
    if (!cy.isMetamaskWindowActive) {
      cy.switchToMetamaskWindow();
      cy.switchToMetamaskNotification();
    }
    cy.wait(500);
  }
}
