"use client";

import React, { useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: number;
}

interface ContentBlock {
  type: 'text' | 'code' | 'inline-math' | 'block-math';
  content: string;
  language?: string;
}

const parseContent = (text: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  let lastIndex = 0;

  // Regex patterns
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
  const inlineMathRegex = /\$([^\$\n]+)\$/g;

  const matches: Array<{ type: string; match: RegExpExecArray; start: number; end: number }> = [];

  // Find all code blocks
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push({
      type: 'code',
      match,
      start: match.index,
      end: codeBlockRegex.lastIndex,
    });
  }

  // Find all block math
  blockMathRegex.lastIndex = 0;
  while ((match = blockMathRegex.exec(text)) !== null) {
    matches.push({
      type: 'block-math',
      match,
      start: match.index,
      end: blockMathRegex.lastIndex,
    });
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Process matches with inline math in remaining text
  matches.forEach(({ type, match, start, end }) => {
    // Add text before this match with inline math parsing
    if (start > lastIndex) {
      const textBefore = text.substring(lastIndex, start);
      parseInlineMath(textBefore, blocks);
    }

    // Add the match
    if (type === 'code') {
      blocks.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'plaintext',
      });
    } else if (type === 'block-math') {
      blocks.push({
        type: 'block-math',
        content: match[1].trim(),
      });
    }

    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parseInlineMath(text.substring(lastIndex), blocks);
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content: text }];
};

const parseInlineMath = (text: string, blocks: ContentBlock[]) => {
  const inlineMathRegex = /\$([^\$\n]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineMathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    blocks.push({
      type: 'inline-math',
      content: match[1],
    });

    lastIndex = inlineMathRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    blocks.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let highlightedCode = code;
  try {
    highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value;
  } catch {
    // Fallback to plaintext
    highlightedCode = hljs.highlight(code, { language: 'plaintext' }).value;
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden bg-bg-secondary border border-white/10">
      <div className="flex justify-between items-center px-4 py-2 bg-bg-primary border-b border-white/5">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 rounded bg-accent-primary/20 hover:bg-accent-primary/30 transition-colors text-xs text-accent-primary"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto">
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className={`language-${language}`}
        />
      </pre>
    </div>
  );
};

const ContentRenderer: React.FC<{ blocks: ContentBlock[] }> = ({ blocks }) => {
  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock key={idx} code={block.content} language={block.language || 'plaintext'} />
            );
          case 'block-math':
            return (
              <div key={idx} className="my-3 px-3 py-2 bg-bg-secondary/50 rounded-lg border border-accent-primary/20 overflow-x-auto">
                <BlockMath math={block.content} />
              </div>
            );
          case 'inline-math':
            return (
              <InlineMath key={idx} math={block.content} />
            );
          case 'text':
            return (
              <span key={idx} className="break-words">
                {block.content}
              </span>
            );
          default:
            return null;
        }
      })}
    </>
  );
};

export default function MessageBubble({ role, content, model }: Message) {
  const isUser = role === 'user';
  const contentBlocks = parseContent(content);

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-accent-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-accent-primary/20">
          <Bot size={16} className="text-accent-primary" />
        </div>
      )}
      <div className={`max-w-md lg:max-w-2xl`}>
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
            <div className="text-sm text-text-secondary">
              <ContentRenderer blocks={contentBlocks} />
            </div>
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
