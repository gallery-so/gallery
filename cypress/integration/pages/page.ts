export default class Page {
  acceptMetamaskAccessRequest() {
    cy.wait(1000);
    cy.acceptMetamaskAccess(false).should('be.true');
    cy.confirmMetamaskSignatureRequest();
    cy.switchToCypressWindow();
    cy.wait(1000);
  }

  closeGlobalAnnouncement() {
    cy.get('[data-testid="close-modal"]').click();
  }
}
