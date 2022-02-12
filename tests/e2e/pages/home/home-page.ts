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
}
