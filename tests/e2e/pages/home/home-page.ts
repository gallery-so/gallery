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

  getMetaMaskButton() {
    return cy.get('[data-testid="wallet-button"]').contains('MetaMask');
  }

  getAccountButton() {
    return cy.get('button').contains('Account');
  }

  getSignOutButton() {
    return cy.get('button').contains('Sign Out');
  }

  getSignInButtonNav() {
    return cy.get('button').contains('Sign In');
  }
}
