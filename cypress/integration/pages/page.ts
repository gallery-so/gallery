export default class Page {
  acceptMetamaskAccessRequest() {
    cy.wait(1000);
    cy.acceptMetamaskAccess(false);
    // Handle intermittent issue the metamask popup is not shown
    if (!cy.isMetamaskWindowActive) {
      cy.switchToMetamaskWindow();
      cy.switchToMetamaskNotification();
    }
    cy.confirmMetamaskSignatureRequest();
    cy.switchToCypressWindow();
    cy.wait(500);
  }
}
