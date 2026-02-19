/**
 * Test fixtures and helpers for Mobile E2E tests (Detox)
 */

// Test user credentials
export const TEST_USERS = {
    primary: {
        email: 'e2e-test-mobile@imuchat.test',
        password: 'TestPassword123!',
    },
    secondary: {
        email: 'e2e-test-mobile-2@imuchat.test',
        password: 'TestPassword456!',
    },
    existing: {
        email: 'existing@imuchat.test',
        password: 'ExistingPassword123!',
    },
};

// Test conversation IDs (should exist in test DB)
export const TEST_CONVERSATIONS = {
    primary: 'test-conversation-1',
    secondary: 'test-conversation-2',
};

// Element IDs for testing
export const TEST_IDS = {
    // Auth screens
    login: {
        emailInput: 'login-email-input',
        passwordInput: 'login-password-input',
        submitButton: 'login-submit-button',
        loading: 'login-loading',
        signupLink: 'signup-link',
        forgotPasswordLink: 'forgot-password-link',
    },
    signup: {
        emailInput: 'signup-email-input',
        passwordInput: 'signup-password-input',
        submitButton: 'signup-submit-button',
        loading: 'signup-loading',
        loginLink: 'login-link',
    },
    forgotPassword: {
        emailInput: 'forgot-password-email-input',
        submitButton: 'forgot-password-submit-button',
        loading: 'forgot-password-loading',
    },
    // Navigation
    tabs: {
        container: 'tabs-container',
        chats: 'tab-chats',
        profile: 'tab-profile',
    },
    // Chat screens
    conversations: {
        list: 'conversations-list',
        item: 'conversation-item',
        avatar: 'conversation-avatar',
        name: 'conversation-name',
        lastMessage: 'conversation-last-message',
        unreadBadge: 'unread-badge',
        searchButton: 'search-conversations-button',
        searchInput: 'search-input',
    },
    chatRoom: {
        container: 'chat-room-container',
        messageList: 'message-list',
        messageInput: 'message-input',
        sendButton: 'send-button',
        attachButton: 'attach-button',
        callButton: 'call-button',
        videoCallButton: 'video-call-button',
        backButton: 'back-button',
        channelHeader: 'channel-header',
        typingIndicator: 'typing-indicator-container',
        loadingMore: 'loading-more-indicator',
    },
    message: {
        bubble: 'message-bubble',
        ownBubble: 'own-message-bubble',
        timestamp: 'message-timestamp',
        actionMenu: 'message-action-menu',
        reactionButton: 'add-reaction-button',
        reactionContainer: 'reaction-container',
    },
    profile: {
        logoutButton: 'logout-button',
    },
};

// Helper function to generate unique test data
export function generateTestEmail(): string {
    return `e2e-test-${Date.now()}-${Math.random().toString(36).substring(7)}@imuchat.test`;
}

export function generateTestMessage(): string {
    return `Test message ${Date.now()}`;
}

// Sleep helper
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
