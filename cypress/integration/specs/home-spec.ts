import HomePage from '../pages/home/home-page';

const home = new HomePage();

describe('Homepage test', () => {
  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    cy.visit('/');
  });

  it('should render the homepage', () => {
    cy.contains('Gallery', { matchCase: false }).should('be.exist');
  });

  it('should redirect to members page when click the explore button', () => {
    home.getExploreButton().should('be.exist');
    home.getExploreButton().click();
    cy.url().should('include', '/home');
  });

  it('should redirect to home page when click the sign in button', () => {
    home.getSignInButton().should('be.exist');
    home.getSignInButton().click();
    home.getMetaMaskButton().click();
    home.acceptMetamaskAccessRequest();

    cy.waitUntil(() => {
      return cy.get('button').contains('My Gallery').should('be.exist');
    });

    cy.url().should('include', `/home`);
  });
});
