import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  X, 
  Layers, 
  Image as ImageIcon, 
  Smile, 
  Star, 
  Clock, 
  ChevronDown, 
  Upload, 
  Check, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import { 
  INITIAL_DISCORD_EMOJIS, 
  DISCORD_SERVERS, 
  STANDARD_UNICODE_EMOJIS, 
  DISCORD_STICKERS,
  DiscordServerEmoji, 
  DiscordEmojiServer 
} from '../data/discordEmojis';
import { registerCustomEmoji, getAllCustomEmojis } from '../utils/emojiParser';

interface EmojiStickerDrawerProps {
  onSelectEmoji: (code: string) => void;
  onSelectSticker: (url: string, name: string) => void;
  onClose: () => void;
}

export const EmojiStickerDrawer: React.FC<EmojiStickerDrawerProps> = ({
  onSelectEmoji,
  onSelectSticker,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers' | 'studio'>('emojis');
  const [search, setSearch] = useState('');
  const [activeServerId, setActiveServerId] = useState<string>('all');
  const [hoveredEmoji, setHoveredEmoji] = useState<DiscordServerEmoji | null>(null);
  const [emojisList, setEmojisList] = useState<DiscordServerEmoji[]>(() => getAllCustomEmojis());
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([':holymoly:', ':xyber_shield:', ':pepe_laugh:', ':matrix_rain:']);
  const [recentCodes, setRecentCodes] = useState<string[]>([':holymoly:', ':anya_smug:', ':fire_100:', ':target_lock:', ':leo_cheers:']);

  // Custom Studio States
  const [uploadShortcode, setUploadShortcode] = useState('');
  const [uploadImageUrl, setUploadImageUrl] = useState('');
  const [uploadServerId, setUploadServerId] = useState('server-era');
  const [uploadIsAnimated, setUploadIsAnimated] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial hovered emoji to holymoly (as in user screenshot)
  useEffect(() => {
    const initial = emojisList.find((e) => e.shortcode === 'holymoly') || emojisList[0];
    if (initial) setHoveredEmoji(initial);
  }, [emojisList]);

  const filteredEmojis = emojisList.filter((e) => {
    const matchesSearch = 
      e.code.toLowerCase().includes(search.toLowerCase()) || 
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.serverName.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeServerId === 'favorites') return favoriteCodes.includes(e.code);
    if (activeServerId === 'recent') return recentCodes.includes(e.code);
    if (activeServerId !== 'all') return e.serverId === activeServerId;
    return true;
  });

  const handleEmojiClick = (emoji: DiscordServerEmoji) => {
    onSelectEmoji(emoji.code);
    // Add to recents
    setRecentCodes((prev) => [emoji.code, ...prev.filter((c) => c !== emoji.code)].slice(0, 15));
  };

  const handleUnicodeEmojiClick = (unicode: string) => {
    onSelectEmoji(unicode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadImageUrl(event.target.result as string);
        if (!uploadShortcode) {
          const rawName = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
          setUploadShortcode(rawName || 'custom_emoji');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomEmoji = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadShortcode || !uploadImageUrl) return;

    const cleanShortcode = uploadShortcode.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const server = DISCORD_SERVERS.find((s) => s.id === uploadServerId) || DISCORD_SERVERS[0];

    const newEmoji: DiscordServerEmoji = {
      id: `custom-emo-${Date.now()}`,
      code: `:${cleanShortcode}:`,
      shortcode: cleanShortcode,
      label: cleanShortcode.replace(/_/g, ' '),
      url: uploadImageUrl,
      isAnimated: uploadIsAnimated,
      serverId: server.id,
      serverName: server.name,
      serverIcon: server.icon,
      category: 'custom',
    };

    registerCustomEmoji(newEmoji);
    setEmojisList((prev) => [newEmoji, ...prev]);
    setRecentCodes((prev) => [newEmoji.code, ...prev]);
    setHoveredEmoji(newEmoji);
    setUploadSuccess(true);

    setTimeout(() => {
      setUploadSuccess(false);
      setUploadShortcode('');
      setUploadImageUrl('');
      setActiveTab('emojis');
    }, 800);
  };

  return (
    <div
      id="discord-emoji-picker"
      className="w-80 sm:w-[440px] md:w-[480px] bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col h-[460px] select-none animate-in fade-in zoom-in-95 duration-150 text-slate-200"
    >
      {/* Top Header & Search Bar (Discord Styled) */}
      <div className="p-3 border-b border-white/10 bg-slate-950/60 backdrop-blur-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('emojis')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'emojis'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Emojis</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stickers'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Stickers</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Emoji</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discord Search Input */}
        {activeTab !== 'studio' && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search custom server emojis (:holymoly:)..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area with Discord Left Vertical Server Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Server Icon Rail (Discord Style) */}
        {activeTab === 'emojis' && (
          <div className="w-12 bg-slate-950/80 border-r border-white/10 flex flex-col items-center py-2 gap-2 overflow-y-auto scrollbar-none shrink-0">
            {/* Favorites Button */}
            <button
              onClick={() => setActiveServerId('favorites')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                activeServerId === 'favorites'
                  ? 'bg-amber-500 text-slate-950 scale-105 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-white/10'
              }`}
              title="Favorites"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            {/* Recents Button */}
            <button
              onClick={() => setActiveServerId('recent')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                activeServerId === 'recent'
                  ? 'bg-cyan-500 text-slate-950 scale-105 shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-white/10'
              }`}
              title="Frequently Used"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* All Emojis */}
            <button
              onClick={() => setActiveServerId('all')}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                activeServerId === 'all'
                  ? 'bg-white text-slate-950 scale-105'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="All Server Emojis"
            >
              ALL
            </button>

            <div className="w-6 h-px bg-white/10 my-0.5" />

            {/* Discord Server Icons Rail */}
            {DISCORD_SERVERS.map((server) => {
              const isSelected = activeServerId === server.id;
              return (
                <button
                  key={server.id}
                  onClick={() => setActiveServerId(server.id)}
                  className={`w-8 h-8 rounded-full overflow-hidden transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={server.name}
                >
                  <img
                    src={server.icon}
                    alt={server.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {server.badge && (
                    <span className="absolute bottom-0 right-0 px-0.5 bg-slate-950 text-[7px] font-bold text-cyan-300 font-mono">
                      {server.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="w-6 h-px bg-white/10 my-0.5" />

            {/* Quick Upload Action */}
            <button
              onClick={() => setActiveTab('studio')}
              className="w-8 h-8 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-all cursor-pointer border border-cyan-500/30"
              title="Add Custom Server Emoji"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Scrollable View */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {/* TAB 1: DISCORD EMOJIS */}
          {activeTab === 'emojis' && (
            <div className="space-y-4">
              {/* Favorites Section */}
              {activeServerId === 'all' && favoriteCodes.length > 0 && !search && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span>Favorites</span>
                    <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                    {favoriteCodes.map((code, idx) => {
                      const emo = emojisList.find((e) => e.code === code);
                      if (!emo) return null;
                      return (
                        <button
                          key={`fav-${emo.code}-${idx}`}
                          onClick={() => handleEmojiClick(emo)}
                          onMouseEnter={() => setHoveredEmoji(emo)}
                          className="p-1.5 rounded-xl bg-slate-950/60 hover:bg-white/10 hover:scale-120 transition-all flex items-center justify-center cursor-pointer relative group"
                          title={emo.code}
                        >
                          <img
                            src={emo.url}
                            alt={emo.label}
                            className="w-7 h-7 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Frequently Used Section */}
              {activeServerId === 'all' && recentCodes.length > 0 && !search && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Frequently Used</span>
                    <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                    {recentCodes.slice(0, 8).map((code, idx) => {
                      const emo = emojisList.find((e) => e.code === code);
                      if (!emo) return null;
                      return (
                        <button
                          key={`rec-${emo.code}-${idx}`}
                          onClick={() => handleEmojiClick(emo)}
                          onMouseEnter={() => setHoveredEmoji(emo)}
                          className="p-1.5 rounded-xl bg-slate-950/60 hover:bg-white/10 hover:scale-120 transition-all flex items-center justify-center cursor-pointer relative group"
                          title={emo.code}
                        >
                          <img
                            src={emo.url}
                            alt={emo.label}
                            className="w-7 h-7 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Server Grouped Emojis */}
              {DISCORD_SERVERS.map((server) => {
                const serverEmojis = filteredEmojis.filter((e) => e.serverId === server.id);
                if (serverEmojis.length === 0) return null;

                return (
                  <div key={server.id} className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="w-4 h-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>{server.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {serverEmojis.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                      {serverEmojis.map((emoji) => (
                        <button
                          key={emoji.id}
                          onClick={() => handleEmojiClick(emoji)}
                          onMouseEnter={() => setHoveredEmoji(emoji)}
                          className="p-1.5 rounded-xl bg-slate-950/40 hover:bg-white/10 hover:scale-120 transition-all flex items-center justify-center cursor-pointer relative group"
                          title={emoji.code}
                        >
                          <img
                            src={emoji.url}
                            alt={emoji.label}
                            className="w-7 h-7 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          {emoji.isAnimated && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-slate-950" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Standard Unicode Emojis */}
              {(activeServerId === 'all' || search) && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Standard Universal Emojis
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-2 text-2xl">
                    {STANDARD_UNICODE_EMOJIS.map((char, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUnicodeEmojiClick(char)}
                        className="p-1.5 rounded-xl hover:bg-white/10 hover:scale-120 transition-all flex items-center justify-center cursor-pointer"
                        title={char}
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STICKERS */}
          {activeTab === 'stickers' && (
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                High-Resolution Tactical Stickers
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DISCORD_STICKERS.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => onSelectSticker(sticker.url, sticker.name)}
                    className="p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-amber-400/60 hover:scale-105 transition-all text-left group cursor-pointer"
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.name}
                      className="w-full h-24 object-cover rounded-xl mb-1.5"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-xs font-bold text-white truncate">{sticker.name}</p>
                    <p className="text-[10px] font-mono text-amber-300/80">{sticker.packName}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM EMOJI STUDIO */}
          {activeTab === 'studio' && (
            <form onSubmit={handleSaveCustomEmoji} className="space-y-3 p-1">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Discord Server Custom Emoji Studio</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Upload custom PNGs, GIFs, or WebPs to any server with auto-scaled 128x128 resolution and custom shortcode tags.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400 bg-slate-950/50 hover:bg-slate-950/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                />
                {uploadImageUrl ? (
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={uploadImageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-contain rounded-xl border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-emerald-400 font-mono">Image loaded! Click to replace</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-cyan-400" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-white">Click or Drag & Drop Image</p>
                      <p className="text-[10px] text-slate-400 font-mono">PNG, GIF, WebP (Max 128x128 5MB)</p>
                    </div>
                  </>
                )}
              </div>

              {/* Shortcode Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-300">
                  Emoji Shortcode (e.g. :pepe_matrix:)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">:</span>
                  <input
                    type="text"
                    value={uploadShortcode}
                    onChange={(e) => setUploadShortcode(e.target.value)}
                    placeholder="holymoly"
                    className="w-full pl-6 pr-6 py-1.5 bg-slate-950 text-xs text-cyan-300 font-mono rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-mono text-xs">:</span>
                </div>
              </div>

              {/* Server Destination */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-300">
                  Target Server / Community Pack
                </label>
                <select
                  value={uploadServerId}
                  onChange={(e) => setUploadServerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 text-xs text-white rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60"
                >
                  {DISCORD_SERVERS.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!uploadShortcode || !uploadImageUrl}
                className={`w-full py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadSuccess
                    ? 'bg-emerald-500 text-slate-950'
                    : uploadShortcode && uploadImageUrl
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Uploaded & Published to Server!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save to Server Emojis</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Active Emoji Inspector (Discord Style Footer) */}
      {hoveredEmoji && activeTab === 'emojis' && (
        <div className="p-2.5 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center p-0.5 shrink-0 shadow-inner">
              <img
                src={hoveredEmoji.url}
                alt={hoveredEmoji.label}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-bold text-white text-xs">{hoveredEmoji.code}</p>
              <p className="text-[10px] text-slate-400">
                from <span className="text-cyan-300">{hoveredEmoji.serverName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hoveredEmoji.isAnimated && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold">
                ANIMATED
              </span>
            )}
            <img
              src={hoveredEmoji.serverIcon}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-white/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
