export interface DiscordServerEmoji {
  id: string;
  code: string; // e.g. ":holymoly:"
  shortcode: string; // e.g. "holymoly"
  label: string;
  url: string;
  isAnimated: boolean;
  serverId: string;
  serverName: string;
  serverIcon: string;
  category: 'favorites' | 'recent' | 'server' | 'memes' | 'cyber' | 'anime' | 'standard' | 'custom';
}

export interface DiscordEmojiServer {
  id: string;
  name: string;
  icon: string;
  color: string;
  badge?: string;
}

export interface DiscordSticker {
  id: string;
  name: string;
  url: string;
  packName: string;
  packIcon: string;
  dimensions: string;
  isAnimated: boolean;
}

export const DISCORD_SERVERS: DiscordEmojiServer[] = [
  {
    id: 'server-era',
    name: 'Era Cyber Collective',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    color: 'bg-purple-600',
    badge: 'ERA',
  },
  {
    id: 'server-sector7',
    name: 'Sector 7 Tactical Mesh',
    icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    color: 'bg-cyan-600',
    badge: 'S7',
  },
  {
    id: 'server-memes',
    name: 'Classic Memes & Emotes',
    icon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    color: 'bg-amber-600',
    badge: 'MEME',
  },
  {
    id: 'server-anime',
    name: 'Anya & Anime Vibes',
    icon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=80&auto=format&fit=crop&q=80',
    color: 'bg-pink-600',
    badge: 'UWU',
  },
  {
    id: 'server-cyber',
    name: 'Matrix & Cipher Hub',
    icon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&auto=format&fit=crop&q=80',
    color: 'bg-emerald-600',
    badge: 'E2EE',
  },
];

// Rich set of authentic custom emojis with shortcodes matching user's screenshot (:holymoly:, :pepe_matrix:, :anya_heh:, etc.)
export const INITIAL_DISCORD_EMOJIS: DiscordServerEmoji[] = [
  // Era Server
  {
    id: 'emo-holymoly',
    code: ':holymoly:',
    shortcode: 'holymoly',
    label: 'Holy Moly',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f632.png',
    isAnimated: true,
    serverId: 'server-era',
    serverName: 'Era Cyber Collective',
    serverIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-skull-ghost',
    code: ':skull_dead:',
    shortcode: 'skull_dead',
    label: 'Dead Skull',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f480.png',
    isAnimated: false,
    serverId: 'server-era',
    serverName: 'Era Cyber Collective',
    serverIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-clown-pepe',
    code: ':clown_pepe:',
    shortcode: 'clown_pepe',
    label: 'Clown Pepe',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f921.png',
    isAnimated: true,
    serverId: 'server-era',
    serverName: 'Era Cyber Collective',
    serverIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-fire-100',
    code: ':fire_100:',
    shortcode: 'fire_100',
    label: '100 Percent',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4af.png',
    isAnimated: false,
    serverId: 'server-era',
    serverName: 'Era Cyber Collective',
    serverIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-sparkles',
    code: ':sparkle_gold:',
    shortcode: 'sparkle_gold',
    label: 'Sparkles',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png',
    isAnimated: true,
    serverId: 'server-era',
    serverName: 'Era Cyber Collective',
    serverIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },

  // Sector 7 Tactical
  {
    id: 'emo-target-lock',
    code: ':target_lock:',
    shortcode: 'target_lock',
    label: 'Target Lock',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3af.png',
    isAnimated: true,
    serverId: 'server-sector7',
    serverName: 'Sector 7 Tactical Mesh',
    serverIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-salute-tac',
    code: ':salute_tactical:',
    shortcode: 'salute_tactical',
    label: 'Tactical Salute',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1fae1.png',
    isAnimated: false,
    serverId: 'server-sector7',
    serverName: 'Sector 7 Tactical Mesh',
    serverIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-shield-verified',
    code: ':xyber_shield:',
    shortcode: 'xyber_shield',
    label: 'Cyber Shield E2EE',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6e1.png',
    isAnimated: true,
    serverId: 'server-sector7',
    serverName: 'Sector 7 Tactical Mesh',
    serverIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-matrix-rain',
    code: ':matrix_rain:',
    shortcode: 'matrix_rain',
    label: 'Matrix Code Rain',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4bb.png',
    isAnimated: true,
    serverId: 'server-sector7',
    serverName: 'Sector 7 Tactical Mesh',
    serverIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },
  {
    id: 'emo-radio-beacon',
    code: ':mesh_radar:',
    shortcode: 'mesh_radar',
    label: 'Mesh Radar Pulse',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e1.png',
    isAnimated: true,
    serverId: 'server-sector7',
    serverName: 'Sector 7 Tactical Mesh',
    serverIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    category: 'server',
  },

  // Classic Memes Server
  {
    id: 'emo-pepe-laugh',
    code: ':pepe_laugh:',
    shortcode: 'pepe_laugh',
    label: 'Pepe Laugh',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f438.png',
    isAnimated: true,
    serverId: 'server-memes',
    serverName: 'Classic Memes & Emotes',
    serverIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    category: 'memes',
  },
  {
    id: 'emo-leo-cheers',
    code: ':leo_cheers:',
    shortcode: 'leo_cheers',
    label: 'Leonardo Cheers',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f942.png',
    isAnimated: true,
    serverId: 'server-memes',
    serverName: 'Classic Memes & Emotes',
    serverIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    category: 'memes',
  },
  {
    id: 'emo-doge-smile',
    code: ':doge_vibe:',
    shortcode: 'doge_vibe',
    label: 'Doge Cyber',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f436.png',
    isAnimated: true,
    serverId: 'server-memes',
    serverName: 'Classic Memes & Emotes',
    serverIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    category: 'memes',
  },
  {
    id: 'emo-mind-blown',
    code: ':mind_blown:',
    shortcode: 'mind_blown',
    label: 'Mind Blown',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f92f.png',
    isAnimated: false,
    serverId: 'server-memes',
    serverName: 'Classic Memes & Emotes',
    serverIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    category: 'memes',
  },
  {
    id: 'emo-side-eye',
    code: ':side_eye:',
    shortcode: 'side_eye',
    label: 'Bombastic Side Eye',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f440.png',
    isAnimated: true,
    serverId: 'server-memes',
    serverName: 'Classic Memes & Emotes',
    serverIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    category: 'memes',
  },

  // Anime Server
  {
    id: 'emo-anya-heh',
    code: ':anya_smug:',
    shortcode: 'anya_smug',
    label: 'Anya Smug Heh',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60f.png',
    isAnimated: true,
    serverId: 'server-anime',
    serverName: 'Anya & Anime Vibes',
    serverIcon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=80&auto=format&fit=crop&q=80',
    category: 'anime',
  },
  {
    id: 'emo-cat-vibe',
    code: ':cat_jam:',
    shortcode: 'cat_jam',
    label: 'Cat Jamming',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f63a.png',
    isAnimated: true,
    serverId: 'server-anime',
    serverName: 'Anya & Anime Vibes',
    serverIcon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=80&auto=format&fit=crop&q=80',
    category: 'anime',
  },

  // Cyber Hub
  {
    id: 'emo-cyber-key',
    code: ':crypto_key:',
    shortcode: 'crypto_key',
    label: 'Hardware Key',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f511.png',
    isAnimated: false,
    serverId: 'server-cyber',
    serverName: 'Matrix & Cipher Hub',
    serverIcon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
  {
    id: 'emo-zap-boost',
    code: ':rocket_mesh:',
    shortcode: 'rocket_mesh',
    label: 'Rocket Boost 480Mbps',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png',
    isAnimated: true,
    serverId: 'server-cyber',
    serverName: 'Matrix & Cipher Hub',
    serverIcon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
  {
    id: 'emo-fire-plasma',
    code: ':plasma_fire:',
    shortcode: 'plasma_fire',
    label: 'Plasma Fire',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png',
    isAnimated: true,
    serverId: 'server-cyber',
    serverName: 'Matrix & Cipher Hub',
    serverIcon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&auto=format&fit=crop&q=80',
    category: 'cyber',
  },
];

export const STANDARD_UNICODE_EMOJIS = [
  '😂', '😭', '🔥', '✨', '💀', '👀', '👍', '❤️', '🚀', '🥰', '🙏', '🫡', 
  '💯', '🥳', '😎', '🎉', '🤯', '🤩', '🤔', '🥺', '🤡', '💩', '🍉', '🍕', 
  '⚡', '🛰️', '🛡️', '🔒', '🔑', '💻', '📡', '🕹️', '👾', '🌈', '💎', '🎯'
];

export const DISCORD_STICKERS: DiscordSticker[] = [
  {
    id: 'stk-tactical-cat',
    name: 'Tactical Operator Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    packName: 'Sector 7 Tactical Stickers',
    packIcon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=80&auto=format&fit=crop&q=80',
    dimensions: '512x512 APNG',
    isAnimated: true,
  },
  {
    id: 'stk-matrix-hacker',
    name: 'Zero-Knowledge Cypherpunk',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
    packName: 'Era Cyber Collective',
    packIcon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
    dimensions: '512x512 Lossless PNG',
    isAnimated: false,
  },
  {
    id: 'stk-doge-rocket',
    name: 'Doge To The Mesh Relay',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
    packName: 'Classic Memes & Emotes',
    packIcon: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=80&auto=format&fit=crop&q=80',
    dimensions: '512x512 WebP',
    isAnimated: true,
  },
];
