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
    'arena': 'arena',
    'pay': 'pay',
    'creators': 'creators',
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
    'arena': '🎮',
    'pay': '💰',
    'creators': '🎨',
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
    'arena': [
        { slug: 'play-games', title: 'Playing games on ImuArena', description: 'Discover and play games' },
        { slug: 'tournaments', title: 'Joining tournaments', description: 'Compete in gaming tournaments' },
    ],
    'pay': [
        { slug: 'wallet-setup', title: 'Setting up ImuWallet', description: 'Configure your digital wallet' },
        { slug: 'send-receive', title: 'Send and receive money', description: 'Transfer funds securely' },
    ],
    'creators': [
        { slug: 'become-creator', title: 'Become a creator', description: 'Start your creator journey' },
        { slug: 'monetization', title: 'Monetization options', description: 'Earn from your content' },
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
    'office': {
        'documents': {
            title: 'Creating documents with ImuDocs',
            content: `
## ImuDocs word processor

Create professional documents with ImuDocs.

### Getting started

1. Open ImuOffice from the sidebar
2. Click "New Document"
3. Choose a template or start blank

### Features

- Rich text formatting
- Tables and images
- Real-time collaboration
- Export to PDF, DOCX
      `,
            updated: '2026-02-15',
            related: ['spreadsheets'],
        },
        'spreadsheets': {
            title: 'Creating spreadsheets with ImuSheets',
            content: `
## ImuSheets for calculations

Work with data using ImuSheets.

### Features

- Formulas and functions
- Charts and graphs
- Pivot tables
- Import/Export CSV, XLSX
      `,
            updated: '2026-02-15',
            related: ['documents'],
        },
    },
    'store': {
        'browse-apps': {
            title: 'Browsing mini-apps',
            content: `
## Discover ImuStore

Find and install mini-apps to enhance your ImuChat experience.

### Categories

Browse by category: Games, Productivity, Social, Entertainment.

### Installing apps

1. Open ImuStore
2. Browse or search
3. Tap "Install"
      `,
            updated: '2026-02-16',
            related: ['imucoins'],
        },
        'imucoins': {
            title: 'Using ImuCoins',
            content: `
## ImuCoins currency

Earn and spend ImuCoins in the ImuChat ecosystem.

### Earning

- Complete daily tasks
- Invite friends
- Participate in events

### Spending

- Premium stickers
- Mini-apps
- Special features
      `,
            updated: '2026-02-16',
            related: ['browse-apps'],
        },
    },
    'arena': {
        'play-games': {
            title: 'Playing games on ImuArena',
            content: `
## Welcome to ImuArena

Play games with friends and compete globally.

### Getting started

1. Open ImuArena from sidebar
2. Browse available games
3. Click "Play" or "Challenge a friend"

### Game types

- Casual games
- Multiplayer battles
- Leaderboard competitions
      `,
            updated: '2026-03-01',
            related: ['tournaments'],
        },
        'tournaments': {
            title: 'Joining tournaments',
            content: `
## Competitive gaming

Participate in tournaments and win prizes.

### How to join

1. Open ImuArena > Tournaments
2. Browse upcoming events
3. Register before deadline

### Rewards

- ImuCoins
- Exclusive badges
- Premium items
      `,
            updated: '2026-03-01',
            related: ['play-games'],
        },
    },
    'pay': {
        'wallet-setup': {
            title: 'Setting up ImuWallet',
            content: `
## ImuWallet setup

Configure your digital wallet for payments.

### Getting started

1. Open ImuPay from sidebar
2. Verify your identity
3. Add a payment method

### Security

- Biometric authentication
- PIN protection
- Fraud alerts
      `,
            updated: '2026-03-02',
            related: ['send-receive'],
        },
        'send-receive': {
            title: 'Send and receive money',
            content: `
## Transfers with ImuPay

Send and receive money safely.

### Sending

1. Open ImuPay
2. Tap "Send"
3. Select contact
4. Enter amount

### Receiving

Share your ImuPay QR code or username.
      `,
            updated: '2026-03-02',
            related: ['wallet-setup'],
        },
    },
    'creators': {
        'become-creator': {
            title: 'Become a creator',
            content: `
## Start your creator journey

Join the ImuChat creator program.

### Requirements

- Account in good standing
- Minimum 100 followers
- Complete creator application

### Benefits

- Creator badge
- Analytics dashboard
- Priority support
      `,
            updated: '2026-03-03',
            related: ['monetization'],
        },
        'monetization': {
            title: 'Monetization options',
            content: `
## Earn from your content

Multiple ways to monetize on ImuChat.

### Options

- Tips from followers
- Premium content
- Sponsorships
- ImuCoin rewards

### Payouts

Withdraw earnings via bank transfer or ImuPay.
      `,
            updated: '2026-03-03',
            related: ['become-creator'],
        },
    },
    'privacy': {
        'data-protection': {
            title: 'Your data protection',
            content: `
## How we protect your data

ImuChat takes privacy seriously.

### Encryption

- End-to-end encryption for messages
- Encrypted storage
- Secure connections (TLS)

### Data minimization

We only collect what's needed.
      `,
            updated: '2026-02-20',
            related: ['download-data'],
        },
        'download-data': {
            title: 'Download your data',
            content: `
## Request your data

Get a copy of all your data.

### How to request

1. Settings > Privacy > My Data
2. Click "Request Download"
3. Receive link via email (24-48h)

### What's included

- Messages, media, contacts, settings
      `,
            updated: '2026-02-20',
            related: ['data-protection'],
        },
    },
    'billing': {
        'subscriptions': {
            title: 'Managing subscriptions',
            content: `
## Subscription management

View and manage your ImuChat subscriptions.

### Available plans

- Free: Basic features
- Plus: Extra storage, themes
- Pro: All features, priority support

### Manage

Settings > Billing > Subscriptions
      `,
            updated: '2026-02-21',
            related: ['payment-methods'],
        },
        'payment-methods': {
            title: 'Payment methods',
            content: `
## Add payment methods

Manage your payment options.

### Supported methods

- Credit/Debit cards
- PayPal
- ImuPay balance
- Mobile payment (Apple Pay, Google Pay)

### Adding

Settings > Billing > Payment Methods > Add New
      `,
            updated: '2026-02-21',
            related: ['subscriptions'],
        },
    },
};
