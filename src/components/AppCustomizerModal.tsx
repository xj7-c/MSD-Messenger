import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Shield, 
  Radio, 
  Key, 
  Ghost, 
  Check, 
  X, 
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import { CustomThemeSettings, ThemeConfig, SoundPackType } from '../types';
import { THEME_PRESETS } from '../data/mockData';
import { soundFx } from '../utils/soundFx';

interface AppCustomizerModalProps {
  currentTheme: CustomThemeSettings;
  onSaveTheme: (theme: CustomThemeSettings) => void;
  onClose: () => void;
}

export const AppCustomizerModal: React.FC<AppCustomizerModalProps> = ({
  currentTheme,
  onSaveTheme,
  onClose,
}) => {
  const [themeMode, setThemeMode] = useState(currentTheme.themeMode);
  const [accentColor, setAccentColor] = useState(currentTheme.accentColor);
  const [bubbleStyle, setBubbleStyle] = useState(currentTheme.bubbleStyle);
  const [soundFxEnabled, setSoundFxEnabled] = useState(currentTheme.soundFxEnabled);
  const [soundPack, setSoundPack] = useState<SoundPackType>(currentTheme.soundPack);
  const [customIcon, setCustomIcon] = useState(currentTheme.customIcon);
  const [fontScale, setFontScale] = useState(currentTheme.fontScale);

  const handleSelectPreset = (preset: ThemeConfig) => {
    setThemeMode(preset.themeMode);
    setAccentColor(preset.accentColor);
    setBubbleStyle(preset.bubbleStyle);
    setSoundPack(preset.soundPack);
    setCustomIcon(preset.customIcon);
    soundFx.setConfig(preset.soundFxEnabled, preset.soundPack);
    soundFx.playReceive();
  };

  const handleTestSound = (pack: SoundPackType) => {
    soundFx.setConfig(true, pack);
    soundFx.playSend();
    setTimeout(() => soundFx.playReceive(), 140);
  };

  const handleSave = () => {
    const updated: CustomThemeSettings = {
      themeMode,
      accentColor,
      bubbleStyle,
      soundFxEnabled,
      soundPack,
      customIcon,
      fontScale,
    };
    soundFx.setConfig(soundFxEnabled, soundPack);
    soundFx.playCryptoVerify();
    onSaveTheme(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-2xl w-full bg-slate-900/70 backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Complete App UI Customization & Theming Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Preset Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">
              Pre-Engineered Tactical Themes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = themeMode === preset.themeMode;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/40 text-cyan-100'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 font-bold" />}
                    </div>
                    <p className="text-xs font-bold text-white">{preset.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 capitalize">
                      {preset.bubbleStyle} • {preset.soundPack}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">
              Primary Accent Color
            </label>
            <div className="flex items-center gap-3">
              {[
                { hex: '#06b6d4', name: 'Cyber Cyan' },
                { hex: '#10b981', name: 'Emerald Mesh' },
                { hex: '#a855f7', name: 'Quantum Purple' },
                { hex: '#f59e0b', name: 'Solar Amber' },
                { hex: '#f43f5e', name: 'Crimson Radar' },
                { hex: '#3b82f6', name: 'Direct Cobalt' },
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setAccentColor(c.hex)}
                  className={`w-9 h-9 rounded-2xl transition-all cursor-pointer relative shadow-md ${
                    accentColor === c.hex ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Message Bubble Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">
              Message Bubble Architecture & Border Styles
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'rounded', name: 'Rounded Smooth' },
                { id: 'cyber-angular', name: 'Cyber Angular' },
                { id: 'minimal', name: 'Minimal Wireframe' },
                { id: 'glassmorphic', name: 'Glassmorphic' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setBubbleStyle(style.id as any)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer backdrop-blur-md ${
                    bubbleStyle === style.id
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tactical Sound Effects Synthesizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-300">
                Synthesized Web Audio Sound Pack
              </label>
              <button
                onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                className={`text-xs font-mono flex items-center gap-1 cursor-pointer ${
                  soundFxEnabled ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {soundFxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundFxEnabled ? 'Audio On' : 'Muted'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { id: 'tactical-mesh', name: 'Tactical Mesh', desc: 'Military RF burst' },
                { id: 'soft-chime', name: 'Soft Chimes', desc: 'Warm acoustic glass' },
                { id: 'cyber-beep', name: 'Cyber Beeps', desc: '80s square wave' },
                { id: 'retro-8bit', name: 'Retro 8-Bit', desc: 'Arcade blips & chips' },
                { id: 'sonar-sub', name: 'Sonar Submarine', desc: 'Deep acoustic ping' },
                { id: 'sci-fi-pulse', name: 'Sci-Fi Pulse', desc: 'Dynamic frequency sweep' },
                { id: 'silent', name: 'Silent', desc: 'Muted audio' },
              ].map((sp) => (
                <div
                  key={sp.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all backdrop-blur-md ${
                    soundPack === sp.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => setSoundPack(sp.id as any)}
                    className="font-medium text-left flex-1 cursor-pointer pr-1"
                  >
                    <p className="font-bold text-white text-xs">{sp.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">{sp.desc}</p>
                  </button>
                  {sp.id !== 'silent' && (
                    <button
                      onClick={() => handleTestSound(sp.id as any)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                      title="Test Audio Synthesizer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom App Launcher Icon */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">
              Application Security Emblem
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'shield-cyan', label: 'Cyan Shield', icon: Shield, color: 'text-cyan-400' },
                { id: 'mesh-radar', label: 'Mesh Radar', icon: Radio, color: 'text-emerald-400' },
                { id: 'secure-key', label: 'Ratchet Key', icon: Key, color: 'text-amber-400' },
                { id: 'ghost-privacy', label: 'Zero Ghost', icon: Ghost, color: 'text-purple-400' },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = customIcon === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCustomIcon(item.id as any)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-md text-cyan-200'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${item.color}`} />
                    <span className="text-[11px] font-medium text-slate-200">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 backdrop-blur-md border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Apply Theme Across App
          </button>
        </div>
      </div>
    </div>
  );
};
