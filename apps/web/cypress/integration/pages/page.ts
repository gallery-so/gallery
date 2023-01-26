export default class Page {
  acceptMetamaskAccessRequest() {
    cy.acceptMetamaskAccess(true).then((connected) => {
      if (!connected) return;
      cy.confirmMetamaskSignatureRequest();
    });
  }
}
