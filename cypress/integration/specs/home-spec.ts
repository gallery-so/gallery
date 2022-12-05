import HomePage from '../pages/home/home-page';
import Page from '../pages/page';

const home = new HomePage();

describe('Homepage test', () => {
  // beforeEach(() => {
  //   // cy.disconnectMetamaskWalletFromAllDapps();
  //   cy.visit('/');
  // });

  context('Homepage', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should render the homepage', () => {
      cy.contains('Gallery', { matchCase: false }).should('be.exist');
    });

    it('should redirect to members page when click the explore button', () => {
      // wait If there is popovers, we need to close it
      // cy.get('[data-testid="close-icon"]').then(($closeIcon) => {
      //   if ($closeIcon.length) {
      //     cy.get('[data-testid="close-icon"]').click();
      //   }
      // });

      home.getExploreButton().should('be.exist');
      home.getExploreButton().click();

      cy.url().should('include', '/home');
    });

    // TODO: reenable when synpress `acceptMetamaskAccessRequest()` bug is fixed!
    it('should redirect to home page when click the sign in button', () => {
      home.getSignInButton().should('be.exist');
      home.getSignInButton().click();
      home.getEthereumButton().click();
      home.getMetaMaskButton().click();
      home.acceptMetamaskAccessRequest();
      cy.url().should('include', `/home`);
    });
  });
});
