"use client";

import React from 'react';
import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

export default function MessageBubble({ role, content, model }: Message) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-accent-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-accent-primary/20">
          <Bot size={16} className="text-accent-primary" />
        </div>
      )}
      <div className={`max-w-md lg:max-w-lg`}>
        {isUser ? (
          <div className="message-user bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3">
            <p className="text-sm text-text-primary break-words">{content}</p>
          </div>
        ) : (
          <div className="message-ai bg-bg-tertiary/50 border border-white/5 rounded-lg p-3">
            {model && (
              <p className="text-xs text-text-tertiary font-semibold mb-2 uppercase tracking-wider">
                {model}
              </p>
            )}
            <p className="text-sm text-text-secondary break-words line-height-relaxed">{content}</p>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-accent-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-accent-primary/20">
          <User size={16} className="text-accent-primary" />
        </div>
      )}
    </div>
  );
}
