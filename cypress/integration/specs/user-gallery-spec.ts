import Page from '../pages/page';

const page = new Page();

describe('user gallery tests', () => {
  beforeEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
  });

  it('should render the gallery', () => {
    page.screenshotPageAcrossDevices('/percyio');
  });
});
