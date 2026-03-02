/**
 * Service Suggestions Intelligentes
 *
 * Smart Reply, Auto-complétion, Résumé de conversations, Détection de ton,
 * Templates de messages — avec fallback local + LLM via Alice backend.
 *
 * Architecture :
 *  - Mode LOCAL : patterns regex, templates statiques, heuristiques
 *  - Mode LLM : proxy via platform-core/alice pour génération avancée
 *  - Persistance : AsyncStorage pour templates custom, résumés, stats, préférences
 *
 * Phase 3 — Groupe 9 IA (Features 9.2 + 9.3)
 */

import type {
    CompletionSuggestion,
    ConversationSummary,
    MessageContext,
    MessageTemplate,
    SmartReply,
    SuggestionsPreferences,
    SuggestionsStats,
    ToneAnalysis,
} from '@/types/suggestions';
import {
    SuggestionSource,
    SuggestionType,
    SummaryLength,
    SummaryStatus,
    TemplateCategory,
    ToneCategory,
} from '@/types/suggestions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('Suggestions');

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    TEMPLATES: 'imuchat-suggestions-templates',
    SUMMARIES: 'imuchat-suggestions-summaries',
    STATS: 'imuchat-suggestions-stats',
    PREFERENCES: 'imuchat-suggestions-preferences',
    TONE_CACHE: 'imuchat-suggestions-tone-cache',
    HISTORY: 'imuchat-suggestions-history',
};

// ============================================================================
// HELPERS
// ============================================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function now() {
    return new Date().toISOString();
}

// ============================================================================
// SMART REPLY PATTERNS (LOCAL FALLBACK)
// ============================================================================

const REPLY_PATTERNS = {
    greeting: {
        patterns: [/\b(salut|bonjour|hello|hi|hey|coucou|yo)\b/i],
        replies: {
            fr: ['Salut !', 'Hello 👋', 'Hey !', 'Coucou !'],
            en: ['Hi!', 'Hello 👋', 'Hey!', 'Hey there!'],
            ja: ['こんにちは！', 'やあ！👋', 'ハロー！'],
        },
    },
    thanks: {
        patterns: [/\b(merci|thanks|thank you|thx|ありがとう)\b/i],
        replies: {
            fr: ['De rien !', 'Avec plaisir 😊', 'Pas de quoi !'],
            en: ["You're welcome!", 'No problem 😊', 'Happy to help!'],
            ja: ['どういたしまして！', 'いいえ😊', 'お役に立てて嬉しいです！'],
        },
    },
    question: {
        patterns: [/\?$/, /\b(est-ce que|comment|pourquoi|quand|où|who|what|when|where|why|how)\b/i],
        replies: {
            fr: ['Bonne question !', 'Laisse-moi réfléchir...', 'Je regarde ça'],
            en: ['Good question!', 'Let me think...', "I'll check"],
            ja: ['いい質問ですね！', '考えてみます...', '確認します'],
        },
    },
    agreement: {
        patterns: [/\b(d'accord|ok|oui|yes|sure|bien sûr|parfait|ok)\b/i],
        replies: {
            fr: ['Super !', 'Parfait 👍', 'Top !'],
            en: ['Great!', 'Perfect 👍', 'Awesome!'],
            ja: ['いいですね！', '完璧👍', '最高！'],
        },
    },
    farewell: {
        patterns: [/\b(bye|à bientôt|salut|au revoir|bonne nuit|good night|ciao)\b/i],
        replies: {
            fr: ['À bientôt !', 'Bonne soirée 👋', 'À plus !'],
            en: ['See you!', 'Take care 👋', 'Bye!'],
            ja: ['またね！', 'お疲れ様👋', 'バイバイ！'],
        },
    },
    invitation: {
        patterns: [/\b(on se voit|rendez-vous|meet|wanna|want to|tu veux)\b/i],
        replies: {
            fr: ['Oui, avec plaisir !', 'Quand ?', 'Ça dépend du moment'],
            en: ['Sure, I\'d love to!', 'When?', 'Depends on when'],
            ja: ['はい、喜んで！', 'いつですか？', '時間によります'],
        },
    },
    apology: {
        patterns: [/\b(désolé|pardon|sorry|excuse|excusez|ごめん)\b/i],
        replies: {
            fr: ['Pas de souci !', "T'inquiète 😊", "C'est rien"],
            en: ['No worries!', "Don't worry 😊", "It's fine"],
            ja: ['大丈夫ですよ！', '気にしないで😊', '問題ないです'],
        },
    },
    excitement: {
        patterns: [/!{2,}/, /\b(génial|trop bien|amazing|awesome|incroyable|wow|cool)\b/i],
        replies: {
            fr: ['Trop bien ! 🎉', 'Génial !', 'J\'adore !'],
            en: ['Amazing! 🎉', 'So cool!', 'Love it!'],
            ja: ['すごい！🎉', '最高！', '大好き！'],
        },
    },
    negative: {
        patterns: [/\b(triste|sad|mal|bad|pas bien|marre|nul|terrible|horrible)\b/i],
        replies: {
            fr: ['Courage 💪', 'Je suis là si tu veux parler', 'Ça va aller'],
            en: ['Hang in there 💪', "I'm here if you need to talk", 'It will get better'],
            ja: ['頑張って💪', '話したかったらいつでも', 'きっと大丈夫'],
        },
    },
};

/** Réponses génériques par défaut */
const DEFAULT_REPLIES = {
    fr: ['Ok 👍', "D'accord", 'Je vois'],
    en: ['Ok 👍', 'Got it', 'I see'],
    ja: ['了解👍', 'わかりました', 'なるほど'],
};

// ============================================================================
// TONE DETECTION PATTERNS
// ============================================================================

const TONE_PATTERNS = {
    positive: [/\b(super|génial|cool|amazing|awesome|great|love|adore|happy|heureux|content|fantastic|excellente?|bien|good|nice|bravo|merci)\b/i, /[😊🥰😍😃🎉❤️👍🙌✨💪]/],
    negative: [/\b(triste|sad|mal|bad|nul|horrible|terrible|déteste|hate|angry|colère|ennui|peur|stressed|anxieux|déprimé|worst)\b/i, /[😢😭😠😡💔😞😒😤]/],
    question: [/\?/, /\b(est-ce que|comment|pourquoi|quand|où|quel|how|what|when|where|why|who|which)\b/i],
    urgent: [/\b(urgent|asap|immédiatement|immediately|now|maintenant|vite|quick|emergency|sos|help|au secours)\b/i, /!{3,}/, /\b[A-Z]{4,}\b/],
    formal: [/\b(cordialement|sincèrement|respectueusement|veuillez|madame|monsieur|dear|regards|sincerely|pursuant)\b/i],
    casual: [/\b(lol|mdr|ptdr|haha|yo|wesh|genre|trop|omg|btw|ngl|fr|tbh)\b/i, /[😂🤣😜😎🙃]/],
    humorous: [/\b(lol|mdr|ptdr|haha|hihi|joke|blague|funny|drôle|marrant)\b/i, /[😂🤣😜🤪]/],
};

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const LANGUAGE_PATTERNS = {
    fr: [/\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|est|et|que|qui|dans|pour|sur|avec|pas|mais|ou|donc|car|bonjour|merci|bien|très|oui|non)\b/i],
    en: [/\b(the|is|are|was|were|have|has|had|been|will|would|could|should|can|may|do|does|did|this|that|these|those|it|he|she|they|we|you|my|your|his|her)\b/i],
    ja: [/[\u3040-\u309F]/, /[\u30A0-\u30FF]/, /[\u4E00-\u9FFF]/],
};

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

const DEFAULT_TEMPLATES: MessageTemplate[] = [
    {
        id: 'tpl_greeting_1',
        title: 'Salutation amicale',
        content: 'Salut {name} ! Comment ça va ? 😊',
        category: TemplateCategory.GREETING,
        language: 'fr',
        variables: [{ name: 'name', placeholder: '{name}', default_value: '' }],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_greeting_2',
        title: 'Salutation formelle',
        content: 'Bonjour {name}, j\'espère que vous allez bien.',
        category: TemplateCategory.GREETING,
        language: 'fr',
        variables: [{ name: 'name', placeholder: '{name}', default_value: '' }],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_thanks_1',
        title: 'Remerciement',
        content: 'Merci beaucoup {name} pour ton aide ! C\'est très apprécié 🙏',
        category: TemplateCategory.THANKS,
        language: 'fr',
        variables: [{ name: 'name', placeholder: '{name}', default_value: '' }],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_invitation_1',
        title: 'Invitation événement',
        content: 'Hey ! On organise {event} le {date}. Tu es dispo ? 🎉',
        category: TemplateCategory.INVITATION,
        language: 'fr',
        variables: [
            { name: 'event', placeholder: '{event}', default_value: 'une soirée' },
            { name: 'date', placeholder: '{date}', default_value: 'samedi' },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_apology_1',
        title: 'Excuses',
        content: 'Désolé pour le retard {name}, {reason}. Ça ne se reproduira pas !',
        category: TemplateCategory.APOLOGY,
        language: 'fr',
        variables: [
            { name: 'name', placeholder: '{name}', default_value: '' },
            { name: 'reason', placeholder: '{reason}', default_value: "j'étais occupé" },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_confirm_1',
        title: 'Confirmation RDV',
        content: 'C\'est confirmé pour {date} à {time} ! On se retrouve {location} 📍',
        category: TemplateCategory.CONFIRMATION,
        language: 'fr',
        variables: [
            { name: 'date', placeholder: '{date}', default_value: 'demain' },
            { name: 'time', placeholder: '{time}', default_value: '14h' },
            { name: 'location', placeholder: '{location}', default_value: 'au café' },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_congrats_1',
        title: 'Félicitations',
        content: 'Félicitations {name} ! 🎉 {message}',
        category: TemplateCategory.CONGRATULATIONS,
        language: 'fr',
        variables: [
            { name: 'name', placeholder: '{name}', default_value: '' },
            { name: 'message', placeholder: '{message}', default_value: 'Bien joué !' },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_farewell_1',
        title: 'Au revoir',
        content: 'À bientôt {name} ! Prends soin de toi 👋',
        category: TemplateCategory.FAREWELL,
        language: 'fr',
        variables: [{ name: 'name', placeholder: '{name}', default_value: '' }],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_question_1',
        title: 'Question rapide',
        content: 'Hey {name}, j\'ai une question rapide : {question}',
        category: TemplateCategory.QUESTION_TEMPLATE,
        language: 'fr',
        variables: [
            { name: 'name', placeholder: '{name}', default_value: '' },
            { name: 'question', placeholder: '{question}', default_value: '' },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'tpl_announce_1',
        title: 'Annonce groupe',
        content: '📢 {title}\n\n{details}\n\nMerci à tous !',
        category: TemplateCategory.ANNOUNCEMENT,
        language: 'fr',
        variables: [
            { name: 'title', placeholder: '{title}', default_value: 'Info importante' },
            { name: 'details', placeholder: '{details}', default_value: '' },
        ],
        usage_count: 0,
        is_custom: false,
        is_favorite: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    },
];

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const DEFAULT_PREFERENCES: SuggestionsPreferences = {
    smart_reply_enabled: true,
    auto_completion_enabled: true,
    tone_detection_enabled: false,
    max_suggestions: 3,
    preferred_tone: ToneCategory.CASUAL,
    preferred_length: 'short',
    language: 'fr',
    use_llm: false,
    show_confidence: false,
};

// ============================================================================
// DEFAULT STATS
// ============================================================================

const DEFAULT_STATS: SuggestionsStats = {
    total_suggestions_shown: 0,
    total_suggestions_used: 0,
    acceptance_rate: 0,
    most_used_type: SuggestionType.SMART_REPLY,
    summaries_generated: 0,
    templates_used: 0,
    top_templates: [],
    daily_usage: [],
};

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

/**
 * Détecte la langue d'un texte
 */
export function detectLanguage(text: string): string {
    if (!text || text.length === 0) return 'fr';

    let scores: Record<string, number> = { fr: 0, en: 0, ja: 0 };

    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
        for (const pattern of patterns) {
            const matches = text.match(new RegExp(pattern.source, 'gi'));
            if (matches) {
                scores[lang] += matches.length;
            }
        }
    }

    const maxLang = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return maxLang[1] > 0 ? maxLang[0] : 'fr';
}

// ============================================================================
// TONE DETECTION
// ============================================================================

/**
 * Analyse le ton d'un message (mode local)
 */
export function analyzeToneLocal(messageId: string, content: string): ToneAnalysis {
    if (!content || content.trim().length === 0) {
        return {
            id: generateId(),
            message_id: messageId,
            primary_tone: ToneCategory.NEUTRAL,
            secondary_tone: null,
            confidence: 0.5,
            emotions: [],
            language: 'fr',
        };
    }

    const scores: Record<string, number> = {};
    for (const [tone, patterns] of Object.entries(TONE_PATTERNS)) {
        let score = 0;
        for (const pattern of patterns) {
            const reFlags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
            const matches = content.match(new RegExp(pattern.source, reFlags));
            if (matches) {
                score += matches.length;
            }
        }
        scores[tone] = score;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0];
    const secondary = sorted[1];
    const totalScore = sorted.reduce((acc, s) => acc + s[1], 0);

    const confidence = totalScore > 0 ? Math.min(primary[1] / totalScore + 0.3, 1.0) : 0.5;
    const language = detectLanguage(content);

    const emotions = sorted
        .filter(s => s[1] > 0)
        .map(s => ({
            emotion: s[0],
            score: totalScore > 0 ? s[1] / totalScore : 0,
        }));

    return {
        id: generateId(),
        message_id: messageId,
        primary_tone: (primary[1] > 0 ? primary[0] : 'neutral') as ToneCategory,
        secondary_tone: (secondary && secondary[1] > 0 ? secondary[0] : null) as ToneCategory | null,
        confidence,
        emotions,
        language,
    };
}

// ============================================================================
// SMART REPLY GENERATION
// ============================================================================

/**
 * Génère des suggestions de réponse rapide (mode local)
 */
export function generateSmartRepliesLocal(context: MessageContext, maxSuggestions?: number): SmartReply[] {
    if (maxSuggestions === undefined) maxSuggestions = 3;

    const content = context.content || '';
    const lang = detectLanguage(content);
    const langKey = lang === 'ja' ? 'ja' : lang === 'en' ? 'en' : 'fr';
    const results: SmartReply[] = [];

    const toneMap: Record<string, ToneCategory> = {
        negative: ToneCategory.POSITIVE,
        question: ToneCategory.NEUTRAL,
    };

    // Check patterns
    for (const [category, config] of Object.entries(REPLY_PATTERNS)) {
        for (const pattern of config.patterns) {
            if (pattern.test(content)) {
                const replies = config.replies[langKey] || config.replies.fr;
                for (const reply of replies) {
                    if (results.length < maxSuggestions * 2) {
                        results.push({
                            id: generateId(),
                            text: reply,
                            type: SuggestionType.SMART_REPLY,
                            confidence: 0.7 + Math.random() * 0.2,
                            tone: toneMap[category] || ToneCategory.CASUAL,
                            source: SuggestionSource.PATTERN,
                            created_at: now(),
                        });
                    }
                }
                break;
            }
        }
    }

    // Add defaults if not enough
    if (results.length < maxSuggestions) {
        const defaults = DEFAULT_REPLIES[langKey] || DEFAULT_REPLIES.fr;
        for (const reply of defaults) {
            if (results.length < maxSuggestions) {
                results.push({
                    id: generateId(),
                    text: reply,
                    type: SuggestionType.SMART_REPLY,
                    confidence: 0.4 + Math.random() * 0.2,
                    tone: ToneCategory.NEUTRAL,
                    source: SuggestionSource.PATTERN,
                    created_at: now(),
                });
            }
        }
    }

    // Sort by confidence, take top N
    const sorted = results.sort((a, b) => b.confidence - a.confidence);
    return sorted.slice(0, maxSuggestions);
}

/**
 * Génère des suggestions de réponse rapide via LLM (Alice backend)
 */
export async function generateSmartRepliesLLM(context: MessageContext, maxSuggestions?: number): Promise<SmartReply[]> {
    if (maxSuggestions === undefined) maxSuggestions = 3;

    const previousContext = (context.previous_messages || [])
        .slice(-5)
        .map(m => `${m.sender_name}: ${m.content}`)
        .join('\n');

    const prompt = `You are a smart reply suggestion engine. Given the following conversation context, suggest ${maxSuggestions} short, natural reply options.

Context:
${previousContext}
${context.sender_name}: ${context.content}

Rules:
- Each reply should be 1-15 words max
- Vary the tone (casual, formal, enthusiastic)  
- Match the language of the conversation
- Return ONLY a JSON array of strings, no explanation

Suggest ${maxSuggestions} replies:`;

    try {
        const response = await fetch(getPlatformCoreUrl() + '/api/v1/alice/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                provider: 'openai',
                providerConfig: { model: 'gpt-4o-mini' },
            }),
        });

        if (!response.ok) {
            throw new Error('LLM request failed');
        }

        const data = await response.json();
        const content = data.message?.content || '[]';

        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid LLM response format');
        }

        const replies: string[] = JSON.parse(jsonMatch[0]);
        return replies.slice(0, maxSuggestions).map((text): SmartReply => ({
            id: generateId(),
            text: String(text),
            type: SuggestionType.SMART_REPLY,
            confidence: 0.85 + Math.random() * 0.1,
            tone: ToneCategory.CASUAL,
            source: SuggestionSource.LLM,
            created_at: now(),
        }));
    } catch (err) {
        log.warn('LLM smart reply failed, falling back to local', err);
        return generateSmartRepliesLocal(context, maxSuggestions);
    }
}

// ============================================================================
// AUTO-COMPLETION
// ============================================================================

/**
 * Génère des suggestions d'auto-complétion (mode local)
 */
export function generateCompletionLocal(partialText: string): CompletionSuggestion[] {
    if (!partialText || partialText.trim().length < 3) return [];

    const lower = partialText.toLowerCase().trim();
    const completions = {
        'est-ce qu': ["est-ce que tu es dispo ?", "est-ce que ça te va ?", "est-ce qu'on peut se voir ?"],
        'je voul': ['je voulais te dire...', 'je voulais savoir si...', 'je voulais te demander...'],
        'on se v': ['on se voit quand ?', 'on se voit demain ?', 'on se voit ce soir ?'],
        'ça te d': ['ça te dit de...', 'ça te dirait de sortir ?'],
        'tu peux': ['tu peux me dire...', 'tu peux venir ?', "tu peux m'aider ?"],
        'i was w': ['I was wondering if...', 'I was wondering about...'],
        'do you': ['do you want to...', 'do you have time?', 'do you know...'],
        'can you': ['can you help me?', 'can you send me...', 'can you come?'],
        'would y': ['would you like to...', 'would you be free?'],
        'let me': ['let me know!', 'let me check.', 'let me think about it.'],
    };

    for (const [prefix, options] of Object.entries(completions)) {
        if (lower.startsWith(prefix)) {
            return options.map((text): CompletionSuggestion => ({
                id: generateId(),
                text: text.substring(partialText.length),
                full_text: text,
                confidence: 0.6 + Math.random() * 0.2,
                source: SuggestionSource.PATTERN,
            }));
        }
    }

    return [];
}

// ============================================================================
// CONVERSATION SUMMARY
// ============================================================================

/**
 * Mock des messages d'une conversation pour démo
 */
function getMockConversationMessages(conversationId: string, messageCount: number) {
    const messages = [];
    const participants = ['Alice', 'Bob', 'Charlie'];
    const topics = ['projet', 'réunion', 'livraison', 'design', 'test'];

    for (let i = 0; i < messageCount; i++) {
        const sender = participants[i % participants.length];
        const topic = topics[Math.floor(i / 3) % topics.length];
        messages.push({
            sender,
            content: `Message ${i + 1} à propos de ${topic} de ${sender}`,
            timestamp: new Date(Date.now() - (messageCount - i) * 60000).toISOString(),
        });
    }

    return { messages, participants };
}

/**
 * Génère un résumé de conversation (mode local — extraction heuristique)
 */
export function generateSummaryLocal(conversationId: string, conversationName: string, messageCount: number, length?: SummaryLength): ConversationSummary {
    if (length === undefined) length = SummaryLength.MEDIUM;

    const { messages, participants } = getMockConversationMessages(conversationId, messageCount);

    // Extract "topics" from messages
    const topicFrequency: Record<string, number> = {};
    for (const msg of messages) {
        const words = msg.content.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (word.length > 4) {
                topicFrequency[word] = (topicFrequency[word] || 0) + 1;
            }
        }
    }
    const topics = Object.entries(topicFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(e => e[0]);

    // Determine length
    const summaryLengths = {
        short: 1,
        medium: 3,
        long: 5,
    };
    const keyPointCount = summaryLengths[length] || 3;

    const keyPoints = [];
    for (let i = 0; i < keyPointCount; i++) {
        keyPoints.push(`Point clé ${i + 1} de la conversation`);
    }

    const actionItems: ConversationSummary['action_items'] = [
        {
            id: generateId(),
            text: 'Suivre les prochaines étapes',
            assignee: participants[0] || null,
            completed: false,
            priority: 'medium',
        },
    ];

    const timeRange = {
        start: messages.length > 0 ? messages[0].timestamp : now(),
        end: messages.length > 0 ? messages[messages.length - 1].timestamp : now(),
    };

    const summary = {
        id: generateId(),
        conversation_id: conversationId,
        conversation_name: conversationName || 'Conversation',
        summary: `Résumé de ${messageCount} messages entre ${participants.join(', ')}. Les principaux sujets abordés sont : ${topics.slice(0, 3).join(', ')}.`,
        key_points: keyPoints,
        participants,
        message_count: messageCount,
        time_range: timeRange,
        topics,
        action_items: actionItems,
        sentiment: ToneCategory.NEUTRAL,
        status: SummaryStatus.COMPLETED,
        length,
        created_at: now(),
        updated_at: now(),
    };

    return summary;
}

/**
 * Génère un résumé via LLM
 */
export async function generateSummaryLLM(conversationId: string, conversationName: string, messageCount: number, length?: SummaryLength): Promise<ConversationSummary> {
    if (length === undefined) length = SummaryLength.MEDIUM;

    const lengthInstructions = {
        short: '2-3 sentences',
        medium: '1 paragraph with bullet points',
        long: 'detailed multi-paragraph',
    };

    const prompt = `Summarize this conversation in ${lengthInstructions[length] || 'a paragraph'}.

Conversation: ${conversationName} (${messageCount} messages)

Return a JSON object with:
- summary: string
- key_points: string[]
- topics: string[]  
- action_items: [{text, assignee, priority}]
- sentiment: "positive"|"negative"|"neutral"`;

    try {
        const response = await fetch(getPlatformCoreUrl() + '/api/v1/alice/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                provider: 'openai',
                providerConfig: { model: 'gpt-4o-mini' },
            }),
        });

        if (!response.ok) throw new Error('LLM summary failed');

        const data = await response.json();
        const content = data.message?.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid LLM response');

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            id: generateId(),
            conversation_id: conversationId,
            conversation_name: conversationName || 'Conversation',
            summary: parsed.summary || 'Summary generation failed',
            key_points: parsed.key_points || [],
            participants: [],
            message_count: messageCount,
            time_range: { start: now(), end: now() },
            topics: parsed.topics || [],
            action_items: (parsed.action_items || []).map((item: { text?: string; assignee?: string; priority?: string }): ConversationSummary['action_items'][0] => ({
                id: generateId(),
                text: item.text || '',
                assignee: item.assignee || null,
                completed: false,
                priority: (item.priority || 'medium') as 'low' | 'medium' | 'high',
            })),
            sentiment: (parsed.sentiment || 'neutral') as ToneCategory,
            status: SummaryStatus.COMPLETED,
            length,
            created_at: now(),
            updated_at: now(),
        };
    } catch (err) {
        log.warn('LLM summary failed, falling back to local', err);
        return generateSummaryLocal(conversationId, conversationName, messageCount, length);
    }
}

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

/**
 * Récupère les templates (defaults + custom depuis AsyncStorage)
 */
export async function getTemplates() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        const customTemplates = stored ? JSON.parse(stored) : [];
        return [...DEFAULT_TEMPLATES, ...customTemplates];
    } catch (err) {
        log.error('Failed to load templates', err);
        return [...DEFAULT_TEMPLATES];
    }
}

/**
 * Récupère les templates par catégorie
 */
export async function getTemplatesByCategory(category: TemplateCategory): Promise<MessageTemplate[]> {
    const all = await getTemplates();
    return all.filter(t => t.category === category);
}

/**
 * Crée un template custom
 */
export async function createTemplate(title: string, content: string, category: TemplateCategory): Promise<MessageTemplate> {
    const template = {
        id: generateId(),
        title,
        content,
        category,
        language: detectLanguage(content),
        variables: extractVariables(content),
        usage_count: 0,
        is_custom: true,
        is_favorite: false,
        created_at: now(),
        updated_at: now(),
    };

    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        const templates = stored ? JSON.parse(stored) : [];
        templates.push(template);
        await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        log.info('Template created:', template.id);
        return template;
    } catch (err) {
        log.error('Failed to create template', err);
        throw err;
    }
}

/**
 * Supprime un template custom
 */
export async function deleteTemplate(templateId: string) {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        const templates: MessageTemplate[] = stored ? JSON.parse(stored) : [];
        const filtered = templates.filter(t => t.id !== templateId);
        await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
        log.info('Template deleted:', templateId);
        return true;
    } catch (err) {
        log.error('Failed to delete template', err);
        return false;
    }
}

/**
 * Bascule le favori d'un template
 */
export async function toggleTemplateFavorite(templateId: string) {
    try {
        const all = await getTemplates();
        const template = all.find(t => t.id === templateId);
        if (!template) return null;

        // Custom templates: update in storage
        if (template.is_custom) {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
            const templates: MessageTemplate[] = stored ? JSON.parse(stored) : [];
            const idx = templates.findIndex(t => t.id === templateId);
            if (idx !== -1) {
                templates[idx].is_favorite = !templates[idx].is_favorite;
                templates[idx].updated_at = now();
                await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
                return templates[idx];
            }
        }

        // For default templates, store favorite state separately
        const favKey = STORAGE_KEYS.TEMPLATES + '-favorites';
        const storedFavs = await AsyncStorage.getItem(favKey);
        const favs = storedFavs ? JSON.parse(storedFavs) : {};
        favs[templateId] = !favs[templateId];
        await AsyncStorage.setItem(favKey, JSON.stringify(favs));

        return { ...template, is_favorite: favs[templateId] };
    } catch (err) {
        log.error('Failed to toggle favorite', err);
        return null;
    }
}

/**
 * Applique des variables à un template
 */
export function applyTemplateVariables(templateContent: string, variables: Record<string, string>): string {
    let result = templateContent;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}

/**
 * Incrémente le compteur d'utilisation d'un template
 */
export async function incrementTemplateUsage(templateId: string) {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        const templates: MessageTemplate[] = stored ? JSON.parse(stored) : [];
        const idx = templates.findIndex(t => t.id === templateId);
        if (idx !== -1) {
            templates[idx].usage_count++;
            templates[idx].updated_at = now();
            await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
        }
    } catch (err) {
        log.error('Failed to increment usage', err);
    }
}

/** Extrait les variables {name} d'un template */
function extractVariables(content: string): Array<{ name: string; placeholder: string; default_value: string }> {
    const regex = /\{(\w+)\}/g;
    const vars: Array<{ name: string; placeholder: string; default_value: string }> = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        if (!vars.find(v => v.name === match![1])) {
            vars.push({
                name: match![1],
                placeholder: `{${match![1]}}`,
                default_value: '',
            });
        }
    }
    return vars;
}

// ============================================================================
// SUMMARY PERSISTENCE
// ============================================================================

/**
 * Sauvegarde un résumé
 */
export async function saveSummary(summary: ConversationSummary) {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARIES);
        const summaries = stored ? JSON.parse(stored) : [];
        summaries.unshift(summary);
        // Keep max 50 summaries
        const trimmed = summaries.slice(0, 50);
        await AsyncStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(trimmed));
        return true;
    } catch (err) {
        log.error('Failed to save summary', err);
        return false;
    }
}

/**
 * Récupère les résumés sauvegardés
 */
export async function getSavedSummaries() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARIES);
        return stored ? JSON.parse(stored) : [];
    } catch (err) {
        log.error('Failed to load summaries', err);
        return [];
    }
}

/**
 * Supprime un résumé
 */
export async function deleteSavedSummary(summaryId: string) {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARIES);
        const summaries: ConversationSummary[] = stored ? JSON.parse(stored) : [];
        const filtered = summaries.filter(s => s.id !== summaryId);
        await AsyncStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(filtered));
        return true;
    } catch (err) {
        log.error('Failed to delete summary', err);
        return false;
    }
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Récupère les stats
 */
export async function getStats() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
        return stored ? JSON.parse(stored) : { ...DEFAULT_STATS };
    } catch (err) {
        log.error('Failed to load stats', err);
        return { ...DEFAULT_STATS };
    }
}

/**
 * Met à jour les stats
 */
export async function updateStats(updates: Partial<SuggestionsStats>) {
    try {
        const current = await getStats();
        const updated = { ...current, ...updates };

        // Recalculate acceptance rate
        if (updated.total_suggestions_shown > 0) {
            updated.acceptance_rate =
                Math.round((updated.total_suggestions_used / updated.total_suggestions_shown) * 100) / 100;
        }

        await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
        return updated;
    } catch (err) {
        log.error('Failed to update stats', err);
        return null;
    }
}

/**
 * Enregistre l'utilisation d'une suggestion
 */
export async function recordSuggestionUsed(type: SuggestionType) {
    const stats: SuggestionsStats = await getStats();
    const today = new Date().toISOString().slice(0, 10);

    let dailyEntry = stats.daily_usage.find(d => d.date === today);
    if (!dailyEntry) {
        dailyEntry = { date: today, suggestions_shown: 0, suggestions_used: 0 };
        stats.daily_usage.push(dailyEntry);
    }
    dailyEntry.suggestions_used++;
    stats.total_suggestions_used++;

    // Keep last 30 days
    stats.daily_usage = stats.daily_usage.slice(-30);

    return updateStats(stats);
}

/**
 * Enregistre une suggestion montrée
 */
export async function recordSuggestionShown() {
    const stats: SuggestionsStats = await getStats();
    const today = new Date().toISOString().slice(0, 10);

    let dailyEntry = stats.daily_usage.find(d => d.date === today);
    if (!dailyEntry) {
        dailyEntry = { date: today, suggestions_shown: 0, suggestions_used: 0 };
        stats.daily_usage.push(dailyEntry);
    }
    dailyEntry.suggestions_shown++;
    stats.total_suggestions_shown++;

    stats.daily_usage = stats.daily_usage.slice(-30);

    return updateStats(stats);
}

// ============================================================================
// PREFERENCES
// ============================================================================

/**
 * Récupère les préférences
 */
export async function getPreferences() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
        return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : { ...DEFAULT_PREFERENCES };
    } catch (err) {
        log.error('Failed to load preferences', err);
        return { ...DEFAULT_PREFERENCES };
    }
}

/**
 * Sauvegarde les préférences
 */
export async function savePreferences(preferences: SuggestionsPreferences) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
        return true;
    } catch (err) {
        log.error('Failed to save preferences', err);
        return false;
    }
}

// ============================================================================
// UTILITY
// ============================================================================

function getPlatformCoreUrl() {
    return (
        (process.env)['EXPO_PUBLIC_PLATFORM_CORE_URL'] || 'http://localhost:8080'
    );
}

/**
 * Récupère les catégories de templates disponibles
 */
export function getTemplateCategories() {
    return [
        'greeting',
        'farewell',
        'thanks',
        'apology',
        'invitation',
        'confirmation',
        'question',
        'announcement',
        'congratulations',
        'custom',
    ];
}

/**
 * Récupère les patterns Smart Reply disponibles (pour debug/test)
 */
export function getReplyPatternCategories() {
    return Object.keys(REPLY_PATTERNS);
}

/**
 * Récupère le nombre de templates par défaut
 */
export function getDefaultTemplateCount() {
    return DEFAULT_TEMPLATES.length;
}
