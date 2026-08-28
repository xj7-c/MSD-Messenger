import React from 'react';
import { INITIAL_DISCORD_EMOJIS, DiscordServerEmoji } from '../data/discordEmojis';

// In-memory custom emoji registry initialized with Discord emojis
let customEmojiRegistry: Map<string, DiscordServerEmoji> = new Map();

function initRegistry() {
  if (customEmojiRegistry.size === 0) {
    INITIAL_DISCORD_EMOJIS.forEach((emo) => {
      customEmojiRegistry.set(emo.code.toLowerCase(), emo);
      customEmojiRegistry.set(`:${emo.shortcode.toLowerCase()}:`, emo);
    });
  }
}

export function registerCustomEmoji(emoji: DiscordServerEmoji) {
  initRegistry();
  customEmojiRegistry.set(emoji.code.toLowerCase(), emoji);
  customEmojiRegistry.set(`:${emoji.shortcode.toLowerCase()}:`, emoji);
}

export function getAllCustomEmojis(): DiscordServerEmoji[] {
  initRegistry();
  return Array.from(new Set(customEmojiRegistry.values()));
}

export function getCustomEmojiByCode(code: string): DiscordServerEmoji | undefined {
  initRegistry();
  const normalized = code.trim().toLowerCase();
  return customEmojiRegistry.get(normalized) || customEmojiRegistry.get(`:${normalized.replace(/:/g, '')}:`);
}

/**
 * Parses message string into React nodes with custom inline/jumbo Discord emojis
 */
export function renderMessageWithEmojis(text: string): React.ReactNode {
  if (!text) return null;
  initRegistry();

  const trimmed = text.trim();
  // Regex to match :shortcode: tokens
  const shortcodeRegex = /(:[a-zA-Z0-9_+-]{2,32}:)/g;

  // Check for Discord Jumboji (if message is purely 1-3 custom emojis or unicode emojis)
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const isAllEmojis = tokens.length > 0 && tokens.length <= 3 && tokens.every((t) => {
    const isCustom = getCustomEmojiByCode(t) !== undefined;
    const isUnicode = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})+$/u.test(t);
    return isCustom || isUnicode;
  });

  if (isAllEmojis) {
    return (
      <div className="flex items-center gap-2 py-1 select-text">
        {tokens.map((token, idx) => {
          const custom = getCustomEmojiByCode(token);
          if (custom) {
            return (
              <div key={idx} className="relative group inline-block">
                <img
                  src={custom.url}
                  alt={custom.code}
                  className="w-12 h-12 object-contain hover:scale-115 transition-transform duration-150 rounded"
                  title={`${custom.code} from ${custom.serverName}`}
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
                  title={`${custom.code} from ${custom.serverName}`}
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
