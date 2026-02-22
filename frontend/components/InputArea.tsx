"use client";

import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, StopCircle, CornerDownLeft, Zap, ShieldCheck, X, FileText } from 'lucide-react';

interface InputAreaProps {
    onSendMessage: (msg: string, file?: File) => void;
    onStop: () => void;
    isLoading: boolean;
}

export default function InputArea({ onSendMessage, onStop, isLoading }: InputAreaProps) {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((input.trim() || selectedFile) && !isLoading) {
            onSendMessage(input, selectedFile || undefined);
            setInput('');
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-12 bg-transparent relative z-20">
            <div className="max-w-5xl mx-auto">

                {/* File Preview Area */}
                {selectedFile && (
                    <div className="mb-3 sm:mb-4 flex animate-in slide-in-from-bottom-4 duration-300">
                        <div className="glass-card p-2.5 sm:p-3 bg-blue-500/10 border-blue-500/30 flex items-center gap-3 sm:gap-4 group/preview relative">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-white/10" />
                            ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-900 flex items-center justify-center border border-white/10">
                                    <FileText size={18} className="sm:w-5 sm:h-5 text-blue-500" />
                                </div>
                            )}
                            <div className="flex flex-col pr-6 sm:pr-8 min-w-0">
                                <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Attached Scan</span>
                                <span className="text-[11px] sm:text-xs font-bold text-white max-w-[120px] sm:max-w-[180px] truncate">{selectedFile.name}</span>
                            </div>
                            <button
                                onClick={removeFile}
                                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 hover:text-red-500 transition-colors"
                                aria-label="Remove file"
                            >
                                <X size={13} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 items-end">
                    <div className="flex-1 relative w-full group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={selectedFile ? "Annotate this scan..." : "Query the Alpha Core..."}
                            className="
                w-full min-h-[60px] sm:min-h-[72px] py-4 sm:py-5 md:py-6 px-5 sm:px-6 md:px-8 pr-12 sm:pr-14 md:pr-16 resize-none
                glass-card bg-slate-900/40 backdrop-blur-3xl border-white/10 focus:border-blue-500/40 focus:outline-none
                placeholder:text-slate-600 placeholder:font-black placeholder:uppercase placeholder:tracking-widest
                text-[14px] sm:text-[15px] md:text-[16px] font-bold text-white transition-all shadow-2xl rounded-xl sm:rounded-2xl
              "
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <div className="absolute right-4 sm:right-5 md:right-6 bottom-4 sm:bottom-5 md:bottom-6 text-slate-700 pointer-events-none group-focus-within:text-blue-500/40 transition-colors">
                            <CornerDownLeft size={16} className="sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]" />
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-2.5 md:gap-3 w-full min-h-[56px] sm:min-h-[60px] md:min-h-[72px]">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                glass-card flex items-center justify-center p-3 sm:p-4 md:p-6 transition-all group/btn min-w-[56px] sm:min-w-[60px] md:min-w-auto
                ${selectedFile ? 'bg-blue-500/20 border-blue-500/40' : 'bg-slate-900/40 border-white/10 hover:bg-white/5'}
              `}
                            title="Optical Scan (OCR)"
                            aria-label="Upload image"
                        >
                            <ImageIcon size={20} className={`sm:w-[21px] sm:h-[21px] md:w-[22px] md:h-[22px] ${selectedFile ? 'text-blue-400' : 'text-slate-500 group-hover/btn:text-blue-500'}`} />
                        </button>

                        {isLoading ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="glass-card bg-red-500/10 border-red-500/30 text-red-500 flex items-center justify-center gap-2 sm:gap-2.5 md:gap-4 px-6 sm:px-8 md:px-10 flex-1 sm:flex-none transition-all hover:bg-red-500/20 active:scale-95 glow-border"
                            >
                                <StopCircle size={20} className="sm:w-[21px] sm:h-[21px] md:w-[22px] md:h-[22px] animate-pulse" />
                                <span className="text-[11px] sm:text-[12px] md:text-[13px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Abort</span>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim() && !selectedFile}
                                className={`
                  glass-card accent-gradient text-white flex items-center justify-center gap-2 sm:gap-2.5 md:gap-4 px-6 sm:px-8 md:px-10 flex-1 sm:flex-none transition-all
                  ${(input.trim() || selectedFile) ? 'shadow-2xl shadow-blue-500/40 opacity-100' : 'opacity-30 grayscale pointer-events-none shadow-none'}
                  active:scale-95 glow-border hover-lift
                `}
                            >
                                <Zap size={20} className="sm:w-[21px] sm:h-[21px] md:w-[22px] md:h-[22px] fill-current" />
                                <span className="text-[11px] sm:text-[12px] md:text-[13px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Execute</span>
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-3 sm:gap-y-4 opacity-30">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <ShieldCheck size={13} className="sm:w-[14px] sm:h-[14px] text-blue-500" />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <Zap size={13} className="sm:w-[14px] sm:h-[14px] text-blue-500" />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">GGUF Quantization: Enabled</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
                        <FileText size={13} className="sm:w-[14px] sm:h-[14px] text-blue-500" />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Multimodal Pipeline: v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
