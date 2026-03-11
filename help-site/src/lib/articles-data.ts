// Shared help articles data
export const locales = ['fr', 'en', 'de', 'es', 'ja'] as const;

// Category slug to translation key mapping
export const categoryTranslationKeys: Record<string, string> = {
  'getting-started': 'gettingStarted',
  'account': 'account',
  'messaging': 'messaging',
  'alice': 'alice',
  'office': 'office',
  'store': 'store',
  'privacy': 'privacy',
  'billing': 'billing',
};

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  'getting-started': '🚀',
  'account': '👤',
  'messaging': '💬',
  'alice': '🤖',
  'office': '📊',
  'store': '🛍️',
  'privacy': '🔒',
  'billing': '💳',
};

// Articles data
export const categoryArticles: Record<string, Array<{ slug: string; title: string; description: string }>> = {
  'getting-started': [
    { slug: 'create-account', title: 'How to create an ImuChat account', description: 'Step-by-step guide to creating your account' },
    { slug: 'setup-profile', title: 'How to set up your profile', description: 'Personalize your ImuChat profile' },
  ],
  'account': [
    { slug: 'security-settings', title: 'Security settings and 2FA', description: 'Protect your account with two-factor authentication' },
    { slug: 'privacy-settings', title: 'Privacy settings', description: 'Control who can see your information' },
  ],
  'messaging': [
    { slug: 'send-messages', title: 'Sending messages', description: 'Learn how to send text, voice, and media messages' },
    { slug: 'voice-video-calls', title: 'Voice and video calls', description: 'Start and manage calls' },
  ],
  'alice': [
    { slug: 'using-alice', title: 'Getting started with Alice AI', description: 'Learn how to use your AI assistant' },
    { slug: 'alice-customization', title: 'Customizing Alice', description: 'Personalize Alice to your preferences' },
  ],
  'office': [
    { slug: 'documents', title: 'Creating documents', description: 'Work with ImuDocs word processor' },
    { slug: 'spreadsheets', title: 'Creating spreadsheets', description: 'Use ImuSheets for calculations' },
  ],
  'store': [
    { slug: 'browse-apps', title: 'Browsing mini-apps', description: 'Discover and install mini-apps' },
    { slug: 'imucoins', title: 'Using ImuCoins', description: 'Earn and spend ImuCoins' },
  ],
  'privacy': [
    { slug: 'data-protection', title: 'Your data protection', description: 'How we protect your data' },
    { slug: 'download-data', title: 'Download your data', description: 'Request a copy of your data' },
  ],
  'billing': [
    { slug: 'subscriptions', title: 'Managing subscriptions', description: 'View and manage your subscriptions' },
    { slug: 'payment-methods', title: 'Payment methods', description: 'Add or update payment methods' },
  ],
};

// Full article content
export const articles: Record<string, Record<string, { title: string; content: string; updated: string; related: string[] }>> = {
  'getting-started': {
    'create-account': {
      title: 'How to create an ImuChat account',
      content: `
## Creating your ImuChat account

Getting started with ImuChat is easy and takes just a few minutes.

### Step 1: Download the app

Download ImuChat from the App Store (iOS) or Google Play (Android). You can also use ImuChat on desktop at app.imuchat.com.

### Step 2: Choose your sign-up method

You can create an account using:
- **Email address** - Enter your email and create a password
- **Phone number** - Receive a verification code via SMS
- **Social login** - Sign in with Google, Apple, or other providers

### Step 3: Verify your account

A verification code will be sent to your email or phone. Enter the 6-digit code to verify your account.

### Step 4: Set up your profile

Add your name, profile photo, and set your preferences. You can always change these later in Settings.

### Tips

- Use a valid email address to ensure you can recover your account if needed
- Choose a strong password with at least 8 characters
- Enable two-factor authentication for extra security
      `,
      updated: '2026-02-15',
      related: ['setup-profile', 'security-settings'],
    },
    'setup-profile': {
      title: 'How to set up your profile',
      content: `
## Setting up your profile

Personalize your ImuChat profile to make it uniquely yours.

### Profile photo

1. Tap your profile icon in the top-left
2. Select "Edit Profile"
3. Tap the camera icon to add or change your photo
4. Choose from your gallery or take a new photo

### Display name

Your display name is what others see when they chat with you.
- Navigate to Settings > Profile
- Tap "Display Name"
- Enter your preferred name (max 30 characters)

### Bio

Add a short bio to tell people about yourself.
- Maximum 150 characters
- Supports emoji

### Status

Set a status message to let contacts know what you're up to.
      `,
      updated: '2026-02-10',
      related: ['create-account', 'privacy-settings'],
    },
  },
  'account': {
    'security-settings': {
      title: 'Security settings and two-factor authentication',
      content: `
## Securing your account

Protect your ImuChat account with enhanced security features.

### Two-Factor Authentication (2FA)

1. Go to Settings > Security
2. Enable "Two-Factor Authentication"
3. Choose your preferred method:
   - Authenticator app (recommended)
   - SMS verification
4. Follow the setup wizard

### Active sessions

View and manage devices logged into your account:
- Settings > Security > Active Sessions
- Tap any session to log it out remotely

### Login alerts

Get notified when someone logs into your account from a new device.
      `,
      updated: '2026-02-18',
      related: ['create-account', 'privacy-settings'],
    },
    'privacy-settings': {
      title: 'Privacy settings',
      content: `
## Managing your privacy

Control who can see your information and contact you.

### Profile visibility

Choose who can see your profile information:
- **Everyone** - Public profile
- **Contacts only** - Only your contacts
- **Nobody** - Private

### Last seen & online status

Control who sees when you were last online.

### Read receipts

Enable or disable read receipts for messages.

### Blocked contacts

Manage your list of blocked users.
      `,
      updated: '2026-02-12',
      related: ['security-settings', 'setup-profile'],
    },
  },
  'alice': {
    'using-alice': {
      title: 'Getting started with Alice AI',
      content: `
## Meet Alice, your AI assistant

Alice is ImuChat's intelligent assistant that can help you with various tasks.

### Starting a conversation

Type @alice followed by your message in any chat, or open a direct conversation with Alice.

### Commands

- **/ask [question]** - Ask Alice anything
- **/translate [text]** - Translate text to another language
- **/summarize** - Summarize a long conversation
- **/remind [time] [message]** - Set a reminder

### Tips for better responses

- Be specific in your questions
- Provide context when needed
- Ask follow-up questions for clarification
      `,
      updated: '2026-02-17',
      related: ['alice-customization'],
    },
    'alice-customization': {
      title: 'Customizing Alice',
      content: `
## Personalizing Alice

Make Alice work better for you with customization options.

### Personality settings

Choose Alice's communication style:
- Professional
- Casual
- Creative
- Concise

### Language preferences

Set Alice's default response language.

### Topic preferences

Tell Alice what topics you're most interested in for better recommendations.
      `,
      updated: '2026-02-14',
      related: ['using-alice'],
    },
  },
};
