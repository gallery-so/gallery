import HomePage from '../pages/home/home-page';

const home = new HomePage();

describe('Homepage test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render the homepage', () => {
    cy.contains('Gallery', { matchCase: false }).should('be.exist');
  });

  it('should redirect to members page when click the explore button', () => {
    home.getExploreButton().should('be.exist');
    home.getExploreButton().click();
    cy.url().should('include', '/members');
  });

  it('should redirect to collection page when click the sign in button', () => {
    home.getSignInButton().should('be.exist');
    home.getSignInButton().click();
    home.getMetaMaskButton().click();
    home.acceptMetamaskAccessRequest();
    cy.confirmMetamaskSignatureRequest();
    cy.url().should('include', `/galleryso`);
    cy.wait(1000);
    home.getAccountButton('galleryso').click();
    home.getSignOutButton().click();

    home.getSignInButtonNav().should('be.exist');
  });
});
