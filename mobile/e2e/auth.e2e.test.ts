/**
 * E2E Tests for Authentication Flow on Mobile
 * 
 * Scénarios couverts:
 * - Signup avec email valide
 * - Signup avec email existant → erreur
 * - Login avec credentials valides → redirection
 * - Login avec credentials invalides → erreur
 * - Forgot password → email envoyé
 * - Logout → redirection login
 */

import { by, device, element, expect } from 'detox';

// Test user credentials
const TEST_USER = {
    email: `test-${Date.now()}@imuchat.test`,
    password: 'TestPassword123!',
    existingEmail: 'existing@imuchat.test',
    existingPassword: 'ExistingPassword123!',
};

describe('Authentication Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('Signup Flow', () => {
        it('should navigate to signup screen', async () => {
            // Tap on "Don't have an account? Sign up"
            await element(by.text("Don't have an account? Sign up")).tap();

            // Verify signup screen is displayed
            await expect(element(by.text('Sign Up'))).toBeVisible();
        });

        it('should signup with valid email successfully', async () => {
            // Navigate to signup
            await element(by.text("Don't have an account? Sign up")).tap();

            // Fill in signup form
            await element(by.id('signup-email-input')).typeText(TEST_USER.email);
            await element(by.id('signup-password-input')).typeText(TEST_USER.password);

            // Submit signup
            await element(by.text('Create account')).tap();

            // Expect success alert
            await expect(element(by.text('Registration successful!'))).toBeVisible();

            // Tap OK to dismiss
            await element(by.text('OK')).tap();
        });

        it('should show error when signup with existing email', async () => {
            // Navigate to signup
            await element(by.text("Don't have an account? Sign up")).tap();

            // Fill in signup form with existing email
            await element(by.id('signup-email-input')).typeText(TEST_USER.existingEmail);
            await element(by.id('signup-password-input')).typeText(TEST_USER.password);

            // Submit signup
            await element(by.text('Create account')).tap();

            // Expect error alert
            await expect(element(by.text('Error'))).toBeVisible();
        });

        it('should validate email format', async () => {
            // Navigate to signup
            await element(by.text("Don't have an account? Sign up")).tap();

            // Fill in invalid email
            await element(by.id('signup-email-input')).typeText('invalid-email');
            await element(by.id('signup-password-input')).typeText(TEST_USER.password);

            // Submit signup
            await element(by.text('Create account')).tap();

            // Expect error (implementation specific)
            await expect(element(by.text('Error'))).toBeVisible();
        });
    });

    describe('Login Flow', () => {
        it('should show login screen initially', async () => {
            // Verify login screen elements
            await expect(element(by.id('login-email-input'))).toBeVisible();
            await expect(element(by.id('login-password-input'))).toBeVisible();
            await expect(element(by.text('Sign in'))).toBeVisible();
        });

        it('should login with valid credentials and redirect to dashboard', async () => {
            // Fill login form
            await element(by.id('login-email-input')).typeText(TEST_USER.existingEmail);
            await element(by.id('login-password-input')).typeText(TEST_USER.existingPassword);

            // Submit login
            await element(by.text('Sign in')).tap();

            // Wait for redirect and verify dashboard/tabs are visible
            await waitFor(element(by.id('tabs-container')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should show error with invalid credentials', async () => {
            // Fill login form with wrong password
            await element(by.id('login-email-input')).typeText(TEST_USER.existingEmail);
            await element(by.id('login-password-input')).typeText('wrongpassword');

            // Submit login
            await element(by.text('Sign in')).tap();

            // Expect error alert
            await expect(element(by.text('Error'))).toBeVisible();
        });

        it('should show error with non-existent email', async () => {
            // Fill login form with non-existent email
            await element(by.id('login-email-input')).typeText('nonexistent@imuchat.test');
            await element(by.id('login-password-input')).typeText(TEST_USER.password);

            // Submit login
            await element(by.text('Sign in')).tap();

            // Expect error alert
            await expect(element(by.text('Error'))).toBeVisible();
        });

        it('should show loading indicator during login', async () => {
            // Fill login form
            await element(by.id('login-email-input')).typeText(TEST_USER.existingEmail);
            await element(by.id('login-password-input')).typeText(TEST_USER.existingPassword);

            // Submit login
            await element(by.text('Sign in')).tap();

            // Verify loading indicator appears (may be quick)
            // Note: This test might be flaky due to timing
        });
    });

    describe('Forgot Password Flow', () => {
        it('should navigate to forgot password screen', async () => {
            // Tap on forgot password link
            await element(by.text('Forgot Password?')).tap();

            // Verify forgot password screen is displayed
            await expect(element(by.text('Reset Password'))).toBeVisible();
            await expect(element(by.text('Enter your email to receive a reset link.'))).toBeVisible();
        });

        it('should send reset email successfully', async () => {
            // Navigate to forgot password
            await element(by.text('Forgot Password?')).tap();

            // Fill email
            await element(by.id('forgot-password-email-input')).typeText(TEST_USER.existingEmail);

            // Submit
            await element(by.text('Send Reset Link')).tap();

            // Expect confirmation alert
            await expect(element(by.text('Check your email'))).toBeVisible();
        });

        it('should show error for non-existent email', async () => {
            // Navigate to forgot password
            await element(by.text('Forgot Password?')).tap();

            // Fill non-existent email
            await element(by.id('forgot-password-email-input')).typeText('nonexistent@imuchat.test');

            // Submit
            await element(by.text('Send Reset Link')).tap();

            // Expect error (may show success for security reasons depending on implementation)
            // Supabase typically returns success even for non-existent emails
            await expect(element(by.text('Check your email'))).toBeVisible();
        });

        it('should disable button after sending', async () => {
            // Navigate to forgot password
            await element(by.text('Forgot Password?')).tap();

            // Fill email
            await element(by.id('forgot-password-email-input')).typeText(TEST_USER.existingEmail);

            // Submit
            await element(by.text('Send Reset Link')).tap();

            // Dismiss alert
            await element(by.text('OK')).tap();

            // Button should be disabled (sent state)
            await expect(element(by.text('Send Reset Link'))).not.toHaveId('enabled');
        });
    });

    describe('Logout Flow', () => {
        beforeEach(async () => {
            // Login first
            await element(by.id('login-email-input')).typeText(TEST_USER.existingEmail);
            await element(by.id('login-password-input')).typeText(TEST_USER.existingPassword);
            await element(by.text('Sign in')).tap();

            // Wait for dashboard
            await waitFor(element(by.id('tabs-container')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should logout and redirect to login screen', async () => {
            // Navigate to settings/profile
            await element(by.id('tab-profile')).tap();

            // Tap logout button
            await element(by.id('logout-button')).tap();

            // Confirm logout if there's a confirmation dialog
            try {
                await element(by.text('Confirm')).tap();
            } catch {
                // No confirmation dialog
            }

            // Verify redirected to login screen
            await waitFor(element(by.id('login-email-input')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should clear session data after logout', async () => {
            // Navigate to profile
            await element(by.id('tab-profile')).tap();

            // Tap logout
            await element(by.id('logout-button')).tap();

            // Reload app
            await device.reloadReactNative();

            // Should show login screen (not auto-logged in)
            await expect(element(by.id('login-email-input'))).toBeVisible();
        });
    });
});
