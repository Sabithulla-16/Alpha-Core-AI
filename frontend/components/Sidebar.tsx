"use client";

import React from 'react';
import { Plus, Clock, X, Menu, Trash2 } from 'lucide-react';

interface SidebarProps {
  models: { id: string, name: string, category: string, icon: any }[];
  selectedModel: string;
  onSelectModel: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  history: any[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export default function Sidebar({
  models,
  selectedModel,
  onSelectModel,
  onNewChat,
  isOpen,
  onToggle,
  history,
  currentChatId,
  onSelectChat,
  onDeleteChat
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`absolute lg:relative w-64 h-screen bg-bg-secondary border-r border-white/5 flex flex-col transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h1 className="text-lg font-bold text-white">Alpha Core</h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="m-4 flex items-center gap-2 justify-center w-full py-2 px-4 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Models Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Models</h3>
          <div className="space-y-2">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onToggle();
                }}
                className={`w-full text-left p-3 rounded-lg transition-all group ${
                  selectedModel === model.id
                    ? 'bg-accent-primary/10 border border-accent-primary/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[16px] ${selectedModel === model.id ? 'text-accent-primary' : 'text-text-tertiary'}`}>
                    {model.icon}
                  </span>
                  <span className={`font-medium text-sm ${selectedModel === model.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {model.name}
                  </span>
                </div>
                <p className="text-[11px] text-text-tertiary ml-6">{model.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="px-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Recent</h3>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-text-tertiary italic">No conversations yet</p>
            ) : (
              history.slice(0, 10).map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    onToggle();
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all group ${
                    currentChatId === chat.id
                      ? 'bg-accent-primary/10 border border-accent-primary/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-secondary line-clamp-2 group-hover:text-accent-primary transition-colors">
                        {chat.title}
                      </p>
                      <p className="text-[11px] text-text-tertiary mt-1">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-xs text-text-tertiary">
          <p>Alpha Core v5.0</p>
          <p className="text-[10px] mt-1">Powered by GGUF LLMs</p>
        </div>
      </aside>
    </>
  );
}
