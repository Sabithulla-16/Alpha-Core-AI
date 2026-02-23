"use client";

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth"
    >
      {messages.map(msg => (
        <MessageBubble key={msg.id} {...msg} />
      ))}
      {isLoading && (
        <div className="flex gap-2 items-end mb-4">
          <div className="w-8 h-8 bg-accent-primary/10 rounded-lg flex items-center justify-center border border-accent-primary/20">
            <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
          </div>
          <div className="text-sm text-text-tertiary italic">Thinking...</div>
        </div>
      )}
      <div className="h-20" />
    </div>
  );
}
