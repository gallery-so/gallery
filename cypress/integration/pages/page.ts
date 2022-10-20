export default class Page {
  acceptMetamaskAccessRequest() {
    cy.wait(1000);
    cy.acceptMetamaskAccess(false).should('be.true');
    cy.confirmMetamaskSignatureRequest();
    cy.switchToCypressWindow();
    cy.wait(1000);
  }

  screenshotPageAcrossDevices(path: string) {
    cy.visit(path);
    cy.wait(5000);
    cy.screenshot(); // desktop
    cy.viewport('ipad-2');
    cy.screenshot(); // tablet
    cy.viewport('iphone-8');
    cy.screenshot(); // mobile
  }
}
