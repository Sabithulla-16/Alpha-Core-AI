"use client";

import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    isThinking?: boolean;
}

interface ChatAreaProps {
    messages: Message[];
    isTyping: boolean;
}

export default function ChatArea({ messages, isTyping }: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-container relative z-10 scroll-smooth">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 sm:space-y-6 px-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center shadow-2xl animate-pulse-glow">
                        <span className="text-2xl sm:text-3xl animate-bounce">✨</span>
                    </div>
                    <div className="text-center px-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 gradient-text">Next-Gen Intelligence</h1>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-sm">
                            Experience lightning-fast reasoning and high-accuracy coding. Select a model to begin.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} {...msg} />
                    ))}
                </div>
            )}

            {/* Large Scroll anchor for floating input area */}
            <div className="h-32 sm:h-40 md:h-48 w-full shrink-0" />
        </div>
    );
}
