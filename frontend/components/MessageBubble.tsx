"use client";

import React, { useState } from 'react';
import { User, Copy, Check, Terminal, Sparkles, Cpu, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    isThinking?: boolean;
}

export default function MessageBubble({ role, content, model, isThinking }: Message) {
    const isAi = role === 'assistant';
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex w-full py-4 sm:py-5 md:py-6 px-3 sm:px-4 md:px-8 ${isAi ? 'justify-start' : 'justify-end'} animate-reveal`}>
            <div className={`
        flex gap-2.5 sm:gap-3 md:gap-4 max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]
        ${isAi ? 'flex-row' : 'flex-row-reverse'}
      `}>
                {/* Avatar */}
                <div className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center transition-all shadow-xl
          ${isAi ? 'accent-gradient text-white border border-blue-500/30' : 'bg-slate-900 text-blue-500 border border-blue-500/20'}
        `}>
                    {isAi ? <Cpu size={18} className="sm:w-5 sm:h-5" /> : <User size={18} className="sm:w-5 sm:h-5" />}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col gap-1.5 sm:gap-2 ${isAi ? 'items-start' : 'items-end'}`}>
                    {isAi && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-blue-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-blue-500/20">
                                {model || 'Alpha Engine'}
                            </span>
                            {isThinking && <div className="thinking-dot" />}
                        </div>
                    )}

                    <div className={`
                        ${isAi ? 'ai-block w-full sm:min-w-[350px] md:min-w-[400px]' : 'user-block w-full sm:min-w-[250px] md:min-w-[300px]'}
                    `}>
                        <div className="prose prose-invert max-w-none text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed font-medium text-slate-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    // KaTeX Formula Blocks
                                    div({ node, className, children, ...props }: any) {
                                        if (className?.includes('math-display')) {
                                            return (
                                                <div className="math-node group/math">
                                                    <button
                                                        className="absolute top-3 right-3 opacity-0 group-hover/math:opacity-100 transition-opacity p-2 glass-item hover:text-blue-500"
                                                        onClick={() => copyToClipboard(String(children))}
                                                        title="Copy Formula"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                    {children}
                                                </div>
                                            );
                                        }
                                        return <div className={className} {...props}>{children}</div>;
                                    },
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeContent = String(children).replace(/\n$/, '');

                                        return !inline && match ? (
                                            <div className="code-container glass-card my-4 sm:my-5 md:my-6">
                                                <div className="flex items-center justify-between px-4 sm:px-5 py-2 sm:py-2.5 border-b border-white/5 bg-black/40">
                                                    <div className="flex items-center gap-2 sm:gap-2.5 text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                        <Terminal size={13} className="sm:w-[14px] sm:h-[14px] text-blue-500" />
                                                        {match[1]}
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(codeContent)}
                                                        className="hover:text-blue-500 transition-colors p-1"
                                                        aria-label="Copy code"
                                                    >
                                                        {copied ? <Check size={13} className="sm:w-[14px] sm:h-[14px] text-green-400" /> : <Copy size={13} className="sm:w-[14px] sm:h-[14px]" />}
                                                    </button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1.25rem', fontSize: '12px', background: 'transparent' }}
                                                    codeTagProps={{ style: { fontSize: '12px' } }}
                                                >
                                                    {codeContent}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-white/5 px-2 py-0.5 rounded text-blue-400 font-bold border border-white/5" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5 sm:mt-1 opacity-50 px-1">
                        {isAi ? 'Synchronized' : 'Encrypted'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
