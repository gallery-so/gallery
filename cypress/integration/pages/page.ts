export default class Page {
  acceptMetamaskAccessRequest() {
    cy.acceptMetamaskAccess().then((connected) => {
      if (!connected) return;
      cy.confirmMetamaskSignatureRequest();
    });
  }
}
