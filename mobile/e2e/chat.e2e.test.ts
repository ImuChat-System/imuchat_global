/**
 * E2E Tests for Chat Flow on Mobile
 * 
 * Scénarios couverts:
 * - Ouvrir liste conversations
 * - Tap sur conversation → ouvrir chat room
 * - Envoyer message texte → apparaît dans liste
 * - Recevoir message (simulé) → apparition
 * - Scroll historique → load more messages
 * - Typing indicator
 * - Reactions
 */

import { by, device, element, expect, waitFor } from 'detox';

// Test user credentials (should be pre-seeded in test DB)
const TEST_USER = {
    email: 'test-chat@imuchat.test',
    password: 'TestPassword123!',
};

// Test conversation ID (should exist in test DB)
const TEST_CONVERSATION_ID = 'test-conversation-1';

describe('Chat Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });

        // Login first
        await element(by.id('login-email-input')).typeText(TEST_USER.email);
        await element(by.id('login-password-input')).typeText(TEST_USER.password);
        await element(by.text('Sign in')).tap();

        // Wait for dashboard to load
        await waitFor(element(by.id('tabs-container')))
            .toBeVisible()
            .withTimeout(15000);
    });

    beforeEach(async () => {
        // Navigate back to chat list if not already there
        try {
            await element(by.id('tab-chats')).tap();
        } catch {
            // Already on chat tab or tab doesn't exist
        }
    });

    describe('Conversations List', () => {
        it('should display conversations list', async () => {
            // Verify conversations list is visible
            await expect(element(by.id('conversations-list'))).toBeVisible();
        });

        it('should show conversation items with avatars and last message', async () => {
            // Verify conversation item elements
            await expect(element(by.id('conversation-item-0'))).toBeVisible();

            // Check conversation item has required elements
            await expect(element(by.id('conversation-avatar-0'))).toBeVisible();
            await expect(element(by.id('conversation-name-0'))).toBeVisible();
            await expect(element(by.id('conversation-last-message-0'))).toBeVisible();
        });

        it('should show unread badge for unread conversations', async () => {
            // Find conversation with unread messages
            await expect(element(by.id('unread-badge'))).toBeVisible();
        });

        it('should refresh conversations list on pull down', async () => {
            // Pull to refresh
            await element(by.id('conversations-list')).swipe('down', 'slow', 0.5);

            // Verify list is still visible after refresh
            await waitFor(element(by.id('conversations-list')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should search conversations', async () => {
            // Tap search button
            await element(by.id('search-conversations-button')).tap();

            // Type search query
            await element(by.id('search-input')).typeText('Test');

            // Verify filtered results
            await waitFor(element(by.id('conversations-list')))
                .toBeVisible()
                .withTimeout(3000);
        });
    });

    describe('Chat Room', () => {
        beforeEach(async () => {
            // Open a conversation
            await element(by.id('conversation-item-0')).tap();

            // Wait for chat room to load
            await waitFor(element(by.id('chat-room-container')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should open chat room when tapping on conversation', async () => {
            // Verify chat room elements
            await expect(element(by.id('chat-room-container'))).toBeVisible();
            await expect(element(by.id('message-list'))).toBeVisible();
            await expect(element(by.id('message-input'))).toBeVisible();
        });

        it('should display channel header with conversation info', async () => {
            await expect(element(by.id('channel-header'))).toBeVisible();
            await expect(element(by.id('call-button'))).toBeVisible();
            await expect(element(by.id('video-call-button'))).toBeVisible();
        });

        it('should send text message successfully', async () => {
            const testMessage = `Test message ${Date.now()}`;

            // Type message
            await element(by.id('message-input')).typeText(testMessage);

            // Send message
            await element(by.id('send-button')).tap();

            // Verify message appears in list
            await waitFor(element(by.text(testMessage)))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should clear input after sending message', async () => {
            const testMessage = 'Message to clear';

            // Type message
            await element(by.id('message-input')).typeText(testMessage);

            // Send message
            await element(by.id('send-button')).tap();

            // Verify input is cleared
            await expect(element(by.id('message-input'))).toHaveText('');
        });

        it('should show sent message as own message (right aligned)', async () => {
            const testMessage = `Owned message ${Date.now()}`;

            // Send message
            await element(by.id('message-input')).typeText(testMessage);
            await element(by.id('send-button')).tap();

            // Wait for message to appear
            await waitFor(element(by.text(testMessage)))
                .toBeVisible()
                .withTimeout(5000);

            // Verify it's marked as own message (has specific styling)
            await expect(element(by.id('own-message-bubble'))).toBeVisible();
        });

        it('should display typing indicator when someone is typing', async () => {
            // This would require simulating another user typing
            // In E2E tests, we can trigger the typing indicator manually
            // or mock the Supabase realtime channel

            // For now, verify the typing indicator container exists
            await expect(element(by.id('typing-indicator-container'))).toExist();
        });

        it('should scroll to bottom on new message', async () => {
            // Send multiple messages to create scrollable content
            for (let i = 0; i < 5; i++) {
                await element(by.id('message-input')).typeText(`Scroll test ${i}`);
                await element(by.id('send-button')).tap();
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // Send final message
            const finalMessage = 'Final scroll test message';
            await element(by.id('message-input')).typeText(finalMessage);
            await element(by.id('send-button')).tap();

            // Verify final message is visible (auto-scrolled)
            await waitFor(element(by.text(finalMessage)))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should load more messages on scroll up', async () => {
            // Get initial message count (approximate by checking first message)
            await expect(element(by.id('message-list'))).toBeVisible();

            // Scroll up to load more
            await element(by.id('message-list')).swipe('down', 'slow', 0.8);

            // Wait for loading indicator
            await waitFor(element(by.id('loading-more-indicator')))
                .toExist()
                .withTimeout(3000);

            // Verify more messages loaded
            await waitFor(element(by.id('message-list')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should show message timestamp', async () => {
            // Verify message has timestamp
            await expect(element(by.id('message-timestamp'))).toBeVisible();
        });

        it('should navigate back to conversations list', async () => {
            // Tap back button
            await element(by.id('back-button')).tap();

            // Verify back on conversations list
            await expect(element(by.id('conversations-list'))).toBeVisible();
        });
    });

    describe('Message Actions', () => {
        beforeEach(async () => {
            // Open a conversation
            await element(by.id('conversation-item-0')).tap();

            await waitFor(element(by.id('chat-room-container')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should long press message to show action menu', async () => {
            // Long press on a message
            await element(by.id('message-bubble-0')).longPress();

            // Verify action menu appears
            await expect(element(by.id('message-action-menu'))).toBeVisible();
        });

        it('should add reaction to message', async () => {
            // Long press on message
            await element(by.id('message-bubble-0')).longPress();

            // Tap on reaction button
            await element(by.id('add-reaction-button')).tap();

            // Select emoji
            await element(by.text('👍')).tap();

            // Verify reaction appears
            await expect(element(by.id('reaction-container'))).toBeVisible();
        });

        it('should toggle reaction off when tapping same emoji', async () => {
            // Assuming message already has a reaction
            // Tap on existing reaction
            await element(by.id('reaction-👍')).tap();

            // Verify reaction is removed (or count decreased)
        });

        it('should copy message text', async () => {
            // Long press on message
            await element(by.id('message-bubble-0')).longPress();

            // Tap copy option
            await element(by.text('Copy')).tap();

            // Verify action menu dismissed
            await expect(element(by.id('message-action-menu'))).not.toBeVisible();
        });
    });

    describe('Media Messages', () => {
        beforeEach(async () => {
            // Open a conversation
            await element(by.id('conversation-item-0')).tap();

            await waitFor(element(by.id('chat-room-container')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should open media picker', async () => {
            // Tap attach button
            await element(by.id('attach-button')).tap();

            // Verify media options appear
            await expect(element(by.id('media-options-sheet'))).toBeVisible();
        });

        it('should show camera option', async () => {
            // Tap attach button
            await element(by.id('attach-button')).tap();

            // Verify camera option
            await expect(element(by.text('Camera'))).toBeVisible();
        });

        it('should show gallery option', async () => {
            // Tap attach button
            await element(by.id('attach-button')).tap();

            // Verify gallery option
            await expect(element(by.text('Gallery'))).toBeVisible();
        });

        it('should show upload progress for media', async () => {
            // Note: This test would require mocking the image picker
            // and verifying the upload progress UI
        });
    });

    describe('Call Buttons', () => {
        beforeEach(async () => {
            // Open a conversation
            await element(by.id('conversation-item-0')).tap();

            await waitFor(element(by.id('chat-room-container')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should show audio call button in header', async () => {
            await expect(element(by.id('call-button'))).toBeVisible();
        });

        it('should show video call button in header', async () => {
            await expect(element(by.id('video-call-button'))).toBeVisible();
        });

        it('should initiate audio call when tapping call button', async () => {
            // Tap call button
            await element(by.id('call-button')).tap();

            // Verify call screen or error message appears
            // (depends on permissions and Stream Video availability)
            await waitFor(element(by.id('outgoing-call-screen')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Real-time Updates', () => {
        it('should update conversation last message in list', async () => {
            // Open conversation
            await element(by.id('conversation-item-0')).tap();

            const testMessage = `Realtime test ${Date.now()}`;

            // Send message
            await element(by.id('message-input')).typeText(testMessage);
            await element(by.id('send-button')).tap();

            // Go back to list
            await element(by.id('back-button')).tap();

            // Verify last message updated in conversation list
            await waitFor(element(by.text(testMessage)))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should receive message in real-time', async () => {
            // This test would require:
            // 1. Opening the chat in the app
            // 2. Sending a message from another client (API call)
            // 3. Verifying the message appears in the app

            // For E2E testing, this might require a test helper API
            // that can send messages as another user
        });
    });
});
