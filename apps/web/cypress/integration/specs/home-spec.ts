import HomePage from '../pages/home/home-page';

const home = new HomePage();

describe('Homepage test', () => {
  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    cy.visit('/');
  });

  context('Homepage', () => {
    it('should redirect to the feed when visiting the homepage', () => {
      cy.visit('/');
      cy.url().should('include', '/activity');
      home.getFeedList().should('be.exist');
    });

    // TODO: reenable when synpress `acceptMetamaskAccessRequest()` bug is fixed!
    // it('should redirect to home page when click the sign in button', () => {
    //   home.getSignInButton().should('be.exist');
    //   home.getSignInButton().click({ force: true });
    //   home.getEthereumButton().click({ force: true });
    //   home.getMetaMaskButton().click({ force: true });
    //   home.acceptMetamaskAccessRequest();
    //   cy.url().should('include', `/home`);
    // });
  });
});
