describe('Home page', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('should render the homepage', () => {
        cy.contains('Gallery', { matchCase: false }).should('be.exist')
    })

    it('should render a sign in button', () => {
        cy.get('[data-testid="sign-in-button"]').should('be.exist')
    })

    it('should render an explorer button', () => {
        cy.get('[data-testid="explore-button"]').should('be.exist')
    })

    it('should redirect to members page when click the explore button', () => {
        cy.get('[data-testid="explore-button"]').click()
        cy.url().should('include', '/members')
    })
})


