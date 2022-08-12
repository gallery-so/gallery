// TODO: re-enable this after rainbowkit issue is reolved: https://github.com/rainbow-me/rainbowkit/issues/461
// unfortunately, mocking the breaking rainbowkit import does not fix the issue
test('NavActionFollow', () => {});

export {};

// import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import AuthProvider from 'contexts/auth/AuthContext';
// import WalletSelector from './WalletSelector';

// describe.skip('WalletSelector', () => {
//   test('Clicking on an option puts the selector in a pending state', async () => {
//     // Silence console.warn that is logged when wallet connection is unsuccesful
//     console.warn = jest.fn();
//     // Mock Metamask installed (metamask injects a global API at window.ethereum)
//     // @ts-expect-error Missing global typedefs
//     global.ethereum = {};

//     render(
//       <AuthProvider>
//         {/* @ts-expect-error: this test isn't used; need to mock graphql */}
//         <WalletSelector />
//       </AuthProvider>
//     );
//     fireEvent.click(screen.getAllByTestId('wallet-button')[0]);
//     await waitFor(() => {
//       expect(screen.getByText('Connecting')).toBeInTheDocument();
//     });

//     //   TODO: can we mock the user's wallet interactions to test success and failure cases?
//     //   TODO: can we reduce the time this test takes?
//   });
// });
