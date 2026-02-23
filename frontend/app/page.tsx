"use client";

import React, { useState,useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputArea from '@/components/InputArea';
import {
  Zap, Code, Brain, Sparkles, Settings as SettingsIcon, X, 
  Menu, Cpu, MessageSquare, Send, ChevronDown, Plus, Trash2
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MODELS = [
  {
    id: 'fast-chat', 
    name: 'Alpha Flash',
    category: 'Speed',
    description: 'Lightning-fast responses for quick queries',
    icon: <Zap size={18} />,
    prompts: ["Summarize this concept", "Quick advice needed", "Brief explanation"]
  },
  {
    id: 'coder', 
    name: 'Code Master',
    category: 'Programming',
    description: 'Expert coding and algorithms',
    icon: <Code size={18} />,
    prompts: ["Debug this code", "Explain algorithm", "Optimize performance"]
  },
  {
    id: 'phi', 
    name: 'Logic Engine',
    category: 'Reasoning',
    description: 'Advanced logical analysis',
    icon: <Brain size={18} />,
    prompts: ["Analyze this problem", "Step-by-step reasoning", "Complex Logic"]
  },
  {
    id: 'orca', 
    name: 'Creative Mind',
    category: 'Creative',
    description: 'Creative writing and reasoning',
    icon: <Sparkles size={18} />,
    prompts: ["Write a story", "Creative ideas", "Brainstorm concepts"]
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  timestamp: number;
}

export default function Home() {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('fast-chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(history));
    }
  }, [history]);

  const saveSession = () => {
    if (messages.length === 0) return;
    const session: ChatSession = {
      id: currentChatId || Date.now().toString(),
      title: messages[0]?.content?.substring(0, 30) + '...' || 'New Chat',
      messages,
      modelId: selectedModel,
      timestamp: Date.now()
    };
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== session.id);
      return [session, ...filtered];
    });
  };

  const handleNewChat = () => {
    saveSession();
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSelectChat = (id: string) => {
    saveSession();
    const chat = history.find(h => h.id === id);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setSelectedModel(chat.modelId);
    }
  };

  const handleModelChange = (modelId: string) => {
    saveSession();
    setSelectedModel(modelId);
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleDeleteChat = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleSendMessage = async (text: string, file?: File) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const context = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          model: selectedModel,
          context,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.body) throw new Error('No response body');

      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: '',
        model: MODELS.find(m => m.id === selectedModel)?.name,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      let done = false;
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  content += parsed.token;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content };
                    return updated;
                  });
                }
              } catch (e) {
                // Parse error
              }
            }
          }
        }
      }

      if (!currentChatId) {
        setCurrentChatId(Date.now().toString());
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Chat error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <main className="flex h-screen w-full bg-bg-primary overflow-hidden">
      <Sidebar
        models={MODELS}
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        history={history}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-bg-secondary/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse shrink-0" />
              <span className="text-sm font-semibold truncate">
                {MODELS.find(m => m.id === selectedModel)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
              <div className="text-center mb-12 max-w-lg">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Brain size={32} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-3 text-white">Welcome to Alpha Core</h1>
                <p className="text-text-tertiary text-sm leading-relaxed mb-8">
                  Choose an AI model and start a conversation. Get fast responses, code help, creative ideas, or deep analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {MODELS.find(m => m.id === selectedModel)?.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="glass-effect-light p-4 rounded-xl text-left hover:bg-white/10 transition-all group"
                  >
                    <p className="text-sm text-white group-hover:text-accent-primary transition-colors line-clamp-2 mb-3 font-medium">
                      {prompt}
                    </p>
                    <div className="flex items-center gap-2 text-accent-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send size={14} />
                      Try it
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChatArea messages={messages} isLoading={isLoading} />
          )}
        </div>

        {/* Input Area */}
        <InputArea
          onSendMessage={handleSendMessage}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </div>

      {/* Settings Sidebar */}
      {isSettingsOpen && (
        <div className="w-80 border-l border-white/5 bg-bg-secondary/40 backdrop-blur-md flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Settings</h3>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 block">
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-accent-primary"
              />
              <p className="text-xs text-text-tertiary mt-2">Controls creativity of responses</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 block">
                Max Tokens: {maxTokens}
              </label>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-bg-tertiary border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="512">512 - Quick</option>
                <option value="1024">1024 - Balanced</option>
                <option value="2048">2048 - Extended</option>
                <option value="4096">4096 - Maximum</option>
              </select>
              <p className="text-xs text-text-tertiary mt-2">Maximum response length</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Model</span>
                  <span className="text-text-secondary">{MODELS.find(m => m.id === selectedModel)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Messages</span>
                  <span className="text-text-secondary">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Status</span>
                  <span className={isLoading ? 'text-red-400' : 'text-green-400'}>
                    {isLoading ? 'Processing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


