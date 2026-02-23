"use client";

import React, { useState, useRef } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (msg: string, file?: File) => void;
  onStop: () => void;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, onStop, isLoading }: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="h-20 border-t border-white/5 bg-bg-secondary/40 backdrop-blur-md flex items-center px-4 md:px-6 shrink-0">
      <form onSubmit={handleSubmit} className="flex-1 flex gap-3 items-center max-w-4xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none resize-none text-sm font-medium"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <StopCircle size={20} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 text-accent-primary hover:bg-accent-primary/10 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Send size={20} />
          </button>
        )}
      </form>
    </div>
  );
}

