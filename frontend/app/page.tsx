"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import InputArea from '@/components/InputArea';
import {
  Bot, Code, Cpu, Sparkles, Plus, Zap,
  Settings as SettingsIcon, X, Sliders,
  Activity, Info, Menu, Shield,
  Wifi, Binary, BrainCircuit
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MODELS = [
  {
    id: 'fast-chat', name: 'Alpha Fast', description: 'Lowest latency for routine queries',
    icon: <Zap size={16} />,
    prompts: ["Draft a short email to my team", "Summarize the concept of Web3", "Quick bread recipe"]
  },
  {
    id: 'coder', name: 'Giga Coder', description: 'Advanced logic & math resolution',
    icon: <Code size={16} />,
    prompts: ["Solve x^2 + 5x + 6 = 0 step by step", "Refactor this React hook for performance", "Explain binary search trees"]
  },
  {
    id: 'phi', name: 'Phi-2 Logic', description: 'High-density logical inference',
    icon: <Cpu size={16} />,
    prompts: ["Analyze the ethics of artificial intelligence", "How does a jet turbine work?", "Compare space-time theories"]
  },
  {
    id: 'orca', name: 'Llama 3.2', description: 'Broad knowledge & creative reasoning',
    icon: <Bot size={16} />,
    prompts: ["Write a short sci-fi story about Mars", "Historical impact of the printing press", "Plan a 3-day trip to Tokyo"]
  },
  {
    id: 'mistral', name: 'Mistral Pro', description: 'Fast 7B model with instruction following',
    icon: <Sparkles size={16} />,
    prompts: ["Write Python code for sorting algorithm", "Explain quantum computing basics", "Compare Python vs JavaScript"]
  },
  {
    id: 'neural', name: 'Neural Chat', description: 'Conversational & context-aware responses',
    icon: <BrainCircuit size={16} />,
    prompts: ["Tell me about yourself", "What can you help me with?", "Explain deep learning"]
  },
  {
    id: 'zephyr', name: 'Zephyr 7B', description: 'Instruction tuned for accuracy',
    icon: <Cpu size={16} />,
    prompts: ["Debug this: console.log is undefined", "What is machine learning?", "Explain APIs"]
  },
  {
    id: 'openhermes', name: 'OpenHermes 2.5', description: 'Reasoning & instruction following',
    icon: <Bot size={16} />,
    prompts: ["Create a marketing plan", "Explain blockchain", "Write a business proposal outline"]
  },
  {
    id: 'starling', name: 'Starling LM', description: 'Optimized for reasoning tasks',
    icon: <Sparkles size={16} />,
    prompts: ["Solve: If A=B and B=C, then A=C", "Explain the scientific method", "Plan project timeline"]
  },
  {
    id: 'dolphin', name: 'Dolphin Mixtral', description: 'Multimodal reasoning powerhouse',
    icon: <Binary size={16} />,
    prompts: ["Complex problem-solving task", "Advanced reasoning needed", "Multi-step analysis"]
  },
];

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  modelId: string;
  timestamp: number;
}

export default function Home() {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('fast-chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Settings States
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    globalMemory: true,
    topP: 0.9,
    repeatPenalty: 1.1
  });

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize: Always Dark Mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const savedHistory = localStorage.getItem('global_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Sync History to LocalStorage (Global Memory Simulation)
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('global_history', JSON.stringify(history));
    }
  }, [history]);

  const saveCurrentSession = () => {
    if (messages.length === 0) return;

    const session: ChatSession = {
      id: currentChatId || Date.now().toString(),
      title: messages[0]?.role === 'user' ? (messages[0].content.length > 30 ? messages[0].content.substring(0, 30) + '...' : messages[0].content) : "New Record",
      messages: [...messages],
      modelId: selectedModel,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== session.id);
      return [session, ...filtered];
    });
  };

  const handleModelChange = (id: string) => {
    saveCurrentSession();
    setSelectedModel(id);
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleNewChat = () => {
    saveCurrentSession();
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSelectChat = (id: string) => {
    saveCurrentSession();
    const chat = history.find(h => h.id === id);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setSelectedModel(chat.modelId);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async (text: string, file?: File) => {
    setIsLoading(true);
    setIsThinking(true);
    abortControllerRef.current = new AbortController();

    let finalPrompt = text;
    let displayPrompt = text;

    // Handle Multimodal (Image + Text)
    if (file) {
      setMessages(prev => [...prev, { role: 'user', content: `[SCANNING_IMAGE: ${file.name}]...` }]);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const ocrResp = await fetch(`${BACKEND_URL}/upload-image`, { method: 'POST', body: formData });
        const ocrData = await ocrResp.json();
        if (ocrData.text) {
          finalPrompt = `[IMAGE_CONTENT]: ${ocrData.text}\n\n[USER_PROMPT]: ${text || "Please analyze this image."}`;
          displayPrompt = text ? `${text}\n\n*(Attached Image Content Processed)*` : "*(Attached Image Processed)*";

          // Update the last message to show combined content
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'user', content: displayPrompt };
            return newMsgs;
          });
        }
      } catch (e) {
        console.error("OCR Failed", e);
        setMessages(prev => [...prev.slice(0, -1), { role: 'user', content: text + " (Image process failed)" }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    }

    try {
      const context = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: finalPrompt,
          model: selectedModel,
          user_id: 'local_user',
          context: settings.globalMemory ? context : [],
          temperature: settings.temperature,
          top_p: settings.topP,
          max_tokens: settings.maxTokens
        })
      });

      if (!response.body) throw new Error('Void link');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        model: MODELS.find(m => m.id === selectedModel)?.name,
        isThinking: true
      }]);

      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                aiContent += data.token;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIdx = newMsgs.length - 1;
                  newMsgs[lastIdx] = {
                    ...newMsgs[lastIdx],
                    content: aiContent,
                    isThinking: false
                  };
                  return newMsgs;
                });
              }
            } catch (e) { }
          }
        }
      }

      if (!currentChatId) setCurrentChatId(Date.now().toString());
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: '### ⚠️ MAIN_LINK_SEVERED\nProtocol failure detected. Reconnect required.' }]);
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  return (
    <main className="flex h-screen w-full bg-background overflow-hidden selection:bg-blue-500/30 selection:text-white bg-mesh relative">
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPlatform={() => setIsPlatformOpen(true)}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Header - Responsive Height */}
        <header className="h-16 sm:h-20 flex items-center px-4 sm:px-6 md:px-10 justify-between shrink-0 relative z-30 bg-black/40 backdrop-blur-3xl border-b border-white/5 w-full">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 flex-1">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 glass-item hover:text-blue-500 transition-all rounded-xl border border-white/5 shrink-0"
                aria-label="Open sidebar"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-0.5">Current Frequency</span>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-tighter uppercase italic truncate">
                  {MODELS.find(m => m.id === selectedModel)?.name}
                </span>
                <div className="hidden xs:block px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm text-[7px] sm:text-[8px] font-black text-blue-500 uppercase tracking-widest shrink-0">GGUF</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">Load</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 md:w-3 h-1 rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-slate-800'}`} />)}
              </div>
            </div>
            <div className="hidden sm:block h-6 md:h-8 w-px bg-white/5" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all ${isLoading ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,134,246,1)] animate-pulse' : 'bg-slate-800'}`} />
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">{isLoading ? 'Busy' : 'Idle'}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden w-full">
          {messages.length === 0 && (
            <div className="p-4 sm:p-6 md:p-12 max-w-5xl mx-auto w-full h-full flex flex-col justify-center overflow-y-auto">
              <div className="mb-8 sm:mb-12 animate-reveal">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-4 sm:mb-6 leading-[0.9] text-white">
                  Alpha Core <span className="text-blue-500 block sm:inline">V5.0</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-tight sm:tracking-widest text-[10px] sm:text-xs md:text-sm max-w-xl leading-relaxed">
                  Deep neural orchestration active. Global records synchronized.
                  Start a logic thread or upload a visual scan for processing.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 animate-reveal [animation-delay:200ms]">
                {MODELS.find(m => m.id === selectedModel)?.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="glass-card p-4 sm:p-6 md:p-8 text-left hover:border-blue-500/30 group transition-all duration-500 glow-border bg-slate-900/40 hover-lift"
                  >
                    <p className="font-bold text-[11px] sm:text-xs md:text-[13px] leading-relaxed mb-4 sm:mb-6 text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight line-clamp-3">
                      "{prompt}"
                    </p>
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-blue-500 fill-current" />
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Initiate Thread</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ChatArea messages={messages} isTyping={isThinking} />
        </div>

        {/* Floating Input Area */}
        <InputArea
          onSendMessage={handleSendMessage}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </div>

      {/* Enhanced Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-3xl p-6 sm:p-8 md:p-12 bg-slate-950/90 border-white/10 relative overflow-hidden glow-border max-h-[90vh] overflow-y-auto custom-scroll">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 p-2 sm:p-2.5 glass-item text-slate-500 hover:text-white rounded-xl"
              aria-label="Close settings"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-10 md:mb-12 pr-8 sm:pr-12">
              <div className="p-3 sm:p-4 bg-blue-500/10 rounded-xl sm:rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <Sliders size={20} className="sm:w-7 sm:h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Neural Config</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5 sm:mt-1">Operator Override Level 4</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
              {/* Left Column */}
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">Creativity (Temp)</label>
                    <span className="text-xs font-mono text-blue-500 font-bold">{settings.temperature}</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">Logic Density (Top-P)</label>
                    <span className="text-xs font-mono text-blue-500 font-bold">{settings.topP}</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={settings.topP}
                    onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="p-4 sm:p-6 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl group transition-all hover:bg-white/[0.07]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BrainCircuit size={16} className="text-blue-500" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white">Global Memory Sync</span>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, globalMemory: !settings.globalMemory })}
                      className={`w-11 sm:w-12 h-5.5 sm:h-6 rounded-full transition-all flex items-center px-1 ${settings.globalMemory ? 'bg-blue-600' : 'bg-slate-800'}`}
                      aria-label="Toggle global memory"
                    >
                      <div className={`w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full transition-all ${settings.globalMemory ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Cross-thread context awareness enabled</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">Max Token Buffer</label>
                    <span className="text-xs font-mono text-blue-500 font-bold">{settings.maxTokens}</span>
                  </div>
                  <select
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500/40"
                  >
                    <option value="512">512 (Fastest)</option>
                    <option value="1024">1024 (Balanced)</option>
                    <option value="2048">2048 (Extended)</option>
                    <option value="4096">4096 (Extreme)</option>
                  </select>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner">
                    <Shield size={18} className="sm:w-5 sm:h-5 text-blue-500 opacity-50 shrink-0" />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest mb-0.5 sm:mb-1">Encryption Protocol</p>
                      <p className="text-[8px] sm:text-[9px] font-black text-blue-500/60 uppercase">AES-256 GCM-POLY1305</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner">
                    <Wifi size={18} className="sm:w-5 sm:h-5 text-blue-500 opacity-50 shrink-0" />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest mb-0.5 sm:mb-1">Latency Optimization</p>
                      <p className="text-[8px] sm:text-[9px] font-black text-blue-500/60 uppercase">Streaming SSE Edge</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-5 md:p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl sm:rounded-2xl flex items-start sm:items-center gap-3 sm:gap-4">
              <Binary size={16} className="sm:w-[18px] sm:h-[18px] text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
                Neural weights verified. Current quantization: 4-bit Medium. Thread allocation: Dynamic (4 Core Min).
                Changes are persisted to terminal local storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Config Modal */}
      {isPlatformOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-2xl p-6 sm:p-8 md:p-12 bg-slate-950/90 border-white/10 relative overflow-hidden glow-border max-h-[90vh] overflow-y-auto custom-scroll">
            <button
              onClick={() => setIsPlatformOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 p-2 sm:p-2.5 glass-item text-slate-500 hover:text-white rounded-xl"
              aria-label="Close platform config"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-10 md:mb-12 pr-8 sm:pr-12">
              <div className="p-3 sm:p-4 bg-blue-500/10 rounded-xl sm:rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <Activity size={20} className="sm:w-7 sm:h-7 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">System Health</h2>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5 sm:mt-1">Module Diagnostic Active</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                { name: 'Memory_Buffer', status: 'Optimal', load: '12%', color: 'bg-blue-500' },
                { name: 'Neural_Pipeline', status: 'Nominal', load: '24%', color: 'bg-blue-500' },
                { name: 'Optical_Sensor (OCR)', status: 'Active', load: '0%', color: 'bg-blue-500' },
                { name: 'GGUF_Engine', status: 'Ready', load: '14%', color: 'bg-blue-500' },
                { name: 'Encryption_Module', status: 'Locked', load: 'Secure', color: 'bg-green-500' }
              ].map(service => (
                <div key={service.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 group hover:bg-white/[0.07] transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{service.name}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase mt-1">Load Factor: {service.load}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 ml-0 sm:ml-auto">
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-500 tracking-widest uppercase">{service.status}</span>
                    <div className={`w-2 h-2 rounded-full ${service.color} shadow-[0_0_10px_rgba(59,134,246,0.5)] animate-pulse`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 flex justify-center">
              <div className="px-4 sm:px-6 py-2 bg-slate-900/50 border border-white/5 rounded-full flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,134,246,1)]" />
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] sm:tracking-[0.2em]">All Systems Nominal: Stable Phase 5</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
