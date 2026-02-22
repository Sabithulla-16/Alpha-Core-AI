"use client";

import React from 'react';
import {
  Plus, MessageSquare, Settings, Sparkles,
  Code, Cpu, Smartphone, X, Menu,
  Clock, Database, Zap, Terminal, BarChart3
} from 'lucide-react';

interface SidebarProps {
  models: { id: string, name: string, description: string, icon: any }[];
  selectedModel: string;
  onSelectModel: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  history: any[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  onOpenPlatform: () => void;
}

export default function Sidebar({
  models, selectedModel, onSelectModel, onNewChat,
  isOpen, onToggle, history, currentChatId, onSelectChat,
  onOpenSettings, onOpenPlatform
}: SidebarProps) {
  return (
    <>
      {/* Mobile Menu Trigger */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 p-2.5 sm:p-3 glass-card md:hidden hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
          aria-label="Open menu"
        >
          <Menu size={20} className="sm:w-5 sm:h-5 text-blue-400" />
        </button>
      )}

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] sm:w-80 glass-panel transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:border-0'}
        flex flex-col p-4 sm:p-5 md:p-6 overflow-hidden scanline-effect
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl accent-gradient flex items-center justify-center shadow-lg shadow-blue-500/20 glow-border shrink-0">
              <Zap size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] text-white fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-black text-lg sm:text-xl tracking-tighter uppercase italic leading-none text-white truncate">
                Alpha Core
              </h1>
              <span className="text-[8px] sm:text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0.5 sm:mt-1 truncate">
                Edge Intelligence V4
              </span>
            </div>
          </div>
          <button onClick={onToggle} className="p-2 glass-item hover:text-blue-400 group transition-all shrink-0" aria-label="Close menu">
            <X size={18} className="sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full p-3 sm:p-3.5 md:p-4 mb-6 sm:mb-8 md:mb-10 accent-gradient text-white rounded-xl sm:rounded-2xl transition-all shadow-2xl shadow-blue-500/30 font-black uppercase tracking-wide sm:tracking-widest active:scale-95 glow-border hover-lift text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
          <span>New Terminal</span>
        </button>

        {/* Navigation Layers */}
        <div className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 md:space-y-10 pr-1 sm:pr-2 custom-scroll">
          {/* Models Layer */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-5 px-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                Neural Engines
              </label>
              <Database size={11} className="sm:w-3 sm:h-3 text-slate-600" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onSelectModel(model.id)}
                  className={`
                    w-full flex items-center gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4 glass-item group relative
                    ${selectedModel === model.id
                      ? 'bg-blue-600/10 border border-blue-500/30 text-white'
                      : 'text-slate-400 border border-transparent'}
                  `}
                >
                  <div className={`
                    p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300
                    ${selectedModel === model.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600 group-hover:bg-slate-800 group-hover:text-slate-400'}
                  `}>
                    {model.icon}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-black text-[11px] sm:text-xs uppercase tracking-tight truncate">{model.name}</div>
                    <div className="text-[8px] sm:text-[9px] font-bold opacity-40 uppercase tracking-tighter truncate mt-0.5">
                      {model.description}
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,134,246,1)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* History Layer */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-5 px-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                Memory Records
              </label>
              <BarChart3 size={11} className="sm:w-3 sm:h-3 text-slate-600" />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              {history.length > 0 ? (
                history.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`
                      w-full flex items-center gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4 text-left glass-item group transition-all
                      ${currentChatId === chat.id
                        ? 'bg-white/5 border border-white/10 text-white shadow-xl'
                        : 'text-slate-500 border border-transparent hover:border-white/5'}
                    `}
                  >
                    <Terminal size={13} className={`sm:w-[14px] sm:h-[14px] shrink-0 ${currentChatId === chat.id ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] sm:text-[11px] font-bold truncate tracking-tight">{chat.title}</div>
                      <div className="text-[7px] sm:text-[8px] font-black opacity-20 mt-0.5 sm:mt-1 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={7} className="sm:w-2 sm:h-2" /> {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 sm:px-4 py-6 sm:py-8 border-2 border-dashed border-slate-800 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center opacity-20">
                  <Terminal size={20} className="sm:w-6 sm:h-6 text-slate-500 mb-1.5 sm:mb-2" />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Buffer Empty</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Controls */}
        <div className="pt-6 sm:pt-8 mt-auto border-t border-slate-900 space-y-2.5 sm:space-y-3">
          <div className="flex gap-2">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-3.5 glass-item bg-slate-900/50 text-slate-400 hover:text-white border border-transparent hover:border-white/10"
              aria-label="Settings"
            >
              <Settings size={14} className="sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Settings</span>
            </button>
            <button
              onClick={onOpenPlatform}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-3.5 glass-item bg-slate-900/50 text-slate-400 hover:text-white border border-transparent hover:border-white/10"
              aria-label="Config"
            >
              <Smartphone size={14} className="sm:w-4 sm:h-4" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Config</span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-500/5 border border-blue-500/10 rounded-lg sm:rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,134,246,1)] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-black text-blue-500/60 uppercase tracking-widest truncate">Mainframe Link: Secure</span>
          </div>
        </div>
      </div>
    </>
  );
}
