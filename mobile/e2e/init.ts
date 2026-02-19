/**
 * Detox initialization file
 * Run before all E2E tests
 */

import { device } from 'detox';

// Set timeout for long-running operations
jest.setTimeout(120000);

beforeAll(async () => {
    // Launch the app
    await device.launchApp({ newInstance: true });
});

// Global cleanup
afterAll(async () => {
    // Terminate app after all tests
});

// Export test utilities
export const TestUtils = {
    // Wait for specific milliseconds
    sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

    // Login helper
    async loginTestUser(email: string, password: string) {
        const { element, by } = await import('detox');

        await element(by.id('login-email-input')).typeText(email);
        await element(by.id('login-password-input')).typeText(password);
        await element(by.text('Sign in')).tap();
    },

    // Logout helper
    async logout() {
        const { element, by } = await import('detox');

        await element(by.id('tab-profile')).tap();
        await element(by.id('logout-button')).tap();
    },
};
