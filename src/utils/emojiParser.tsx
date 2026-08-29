import React from 'react';
import { INITIAL_DISCORD_EMOJIS, DiscordServerEmoji } from '../data/discordEmojis';

// In-memory custom emoji registry initialized with Discord emojis + local storage
let customEmojiRegistry: Map<string, DiscordServerEmoji> = new Map();
let isInitialized = false;

function loadStoredCustomEmojis(): DiscordServerEmoji[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('meshguard_custom_emojis_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

function saveCustomEmojisToStorage() {
  if (typeof window === 'undefined') return;
  try {
    const all = Array.from(new Set(customEmojiRegistry.values()));
    const customOnly = all.filter((e) => e.category === 'custom' || e.serverId.startsWith('custom-') || e.id.startsWith('custom-'));
    localStorage.setItem('meshguard_custom_emojis_v4', JSON.stringify(customOnly));
  } catch (e) {
    // ignore
  }
}

export function initRegistry() {
  if (isInitialized && customEmojiRegistry.size > 0) return;
  
  // 1. Load baseline Discord emojis
  INITIAL_DISCORD_EMOJIS.forEach((emo) => {
    customEmojiRegistry.set(emo.code.toLowerCase(), emo);
    customEmojiRegistry.set(`:${emo.shortcode.toLowerCase()}:`, emo);
  });

  // 2. Load stored custom emojis from localStorage
  const stored = loadStoredCustomEmojis();
  stored.forEach((emo) => {
    if (emo && emo.code && emo.url) {
      const cleanShortcode = emo.shortcode || emo.code.replace(/:/g, '');
      const fullEmo: DiscordServerEmoji = {
        ...emo,
        code: `:${cleanShortcode}:`,
        shortcode: cleanShortcode,
      };
      customEmojiRegistry.set(fullEmo.code.toLowerCase(), fullEmo);
      customEmojiRegistry.set(`:${fullEmo.shortcode.toLowerCase()}:`, fullEmo);
    }
  });

  isInitialized = true;
}

export function registerCustomEmoji(emoji: DiscordServerEmoji, saveStorage: boolean = true) {
  initRegistry();
  const cleanShortcode = emoji.shortcode ? emoji.shortcode.toLowerCase().replace(/[^a-z0-9_+-]/g, '') : emoji.code.toLowerCase().replace(/:/g, '');
  const standardizedEmoji: DiscordServerEmoji = {
    ...emoji,
    code: `:${cleanShortcode}:`,
    shortcode: cleanShortcode,
  };

  customEmojiRegistry.set(standardizedEmoji.code.toLowerCase(), standardizedEmoji);
  customEmojiRegistry.set(`:${standardizedEmoji.shortcode.toLowerCase()}:`, standardizedEmoji);

  if (saveStorage) {
    saveCustomEmojisToStorage();
  }
  return standardizedEmoji;
}

export function registerCustomEmojisList(emojis: DiscordServerEmoji[]) {
  if (!emojis || !Array.isArray(emojis)) return;
  initRegistry();
  emojis.forEach((emo) => {
    if (emo && (emo.code || emo.shortcode) && emo.url) {
      registerCustomEmoji(emo, true);
    }
  });
}

export function getAllCustomEmojis(): DiscordServerEmoji[] {
  initRegistry();
  return Array.from(new Set(customEmojiRegistry.values()));
}

export function getCustomEmojiByCode(code: string): DiscordServerEmoji | undefined {
  initRegistry();
  if (!code) return undefined;
  const normalized = code.trim().toLowerCase();
  const stripped = normalized.replace(/^:+|:+$/g, '');
  return customEmojiRegistry.get(normalized) || customEmojiRegistry.get(`:${stripped}:`) || customEmojiRegistry.get(stripped);
}

/**
 * Scans a string and returns all custom emoji objects referenced inside :shortcode: tokens
 */
export function extractCustomEmojisForText(text: string): DiscordServerEmoji[] {
  if (!text) return [];
  initRegistry();
  const shortcodeRegex = /(:[a-zA-Z0-9_+-]{1,64}:)/g;
  const matches = text.match(shortcodeRegex) || [];
  const found: DiscordServerEmoji[] = [];

  for (const token of matches) {
    const emo = getCustomEmojiByCode(token);
    if (emo && !found.some((f) => f.code.toLowerCase() === emo.code.toLowerCase())) {
      found.push(emo);
    }
  }

  return found;
}

/**
 * Parses message string into React nodes with custom inline/jumbo Discord emojis
 */
export function renderMessageWithEmojis(
  text: string, 
  customPayload?: DiscordServerEmoji[]
): React.ReactNode {
  if (!text) return null;
  initRegistry();

  // If custom payload attached to message, register them immediately
  if (customPayload && Array.isArray(customPayload) && customPayload.length > 0) {
    registerCustomEmojisList(customPayload);
  }

  const trimmed = text.trim();
  // Regex to match :shortcode: tokens (supports digits, e.g. :1000005333:)
  const shortcodeRegex = /(:[a-zA-Z0-9_+-]{1,64}:)/g;

  // Check for Discord Jumboji (if message is purely 1-4 custom emojis or unicode emojis)
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const isAllEmojis = tokens.length > 0 && tokens.length <= 4 && tokens.every((t) => {
    const isCustom = getCustomEmojiByCode(t) !== undefined;
    const isUnicode = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})+$/u.test(t);
    return isCustom || isUnicode;
  });

  if (isAllEmojis) {
    return (
      <div className="flex items-center gap-2 py-1 select-text flex-wrap">
        {tokens.map((token, idx) => {
          const custom = getCustomEmojiByCode(token);
          if (custom) {
            return (
              <div key={idx} className="relative group inline-block">
                <img
                  src={custom.url}
                  alt={custom.code}
                  className="w-12 h-12 object-contain hover:scale-115 transition-transform duration-150 rounded"
                  title={`${custom.code} from ${custom.serverName || 'Custom Pack'}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            );
          }
          return (
            <span key={idx} className="text-4xl leading-none inline-block hover:scale-110 transition-transform">
              {token}
            </span>
          );
        })}
      </div>
    );
  }

  // Mixed text and inline emojis
  const parts = text.split(shortcodeRegex);

  return (
    <span>
      {parts.map((part, index) => {
        if (shortcodeRegex.test(part)) {
          const custom = getCustomEmojiByCode(part);
          if (custom) {
            return (
              <span key={index} className="inline-block align-middle mx-0.5 group relative">
                <img
                  src={custom.url}
                  alt={custom.code}
                  className="inline-block w-6 h-6 object-contain align-middle hover:scale-125 transition-transform duration-150 rounded cursor-pointer"
                  title={`${custom.code} from ${custom.serverName || 'Custom Pack'}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </span>
            );
          }
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
