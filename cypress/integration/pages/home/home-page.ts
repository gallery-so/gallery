import Page from '../page';

export default class HomePage extends Page {
  visit() {
    cy.visit('/');
  }

  getSignInButton() {
    return cy.get('[data-testid="sign-in-button"]');
  }

  getExploreButton() {
    return cy.get('[data-testid="explore-button"]');
  }

  getEthereumButton() {
    return cy.get('[data-testid="wallet-button"]').contains('Ethereum');
  }

  getMetaMaskButton() {
    return cy.get('button').contains('MetaMask');
  }

  getAccountButton(username: string) {
    return cy.get('button').contains(username);
  }

  getSignOutButton() {
    return cy.get('p').contains('Sign out');
  }

  getSignInButtonNav() {
    return cy.get('button').contains('Sign In');
  }
}
