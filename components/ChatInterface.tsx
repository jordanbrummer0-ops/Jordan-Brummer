import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DeviceModel } from '../types';
import { sendMessageToGemini, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface ChatInterfaceProps {
  selectedDevice?: DeviceModel | null;
  onOpenLive?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedDevice, onOpenLive }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: selectedDevice 
        ? `Hello! I see you're looking for help with the **${selectedDevice.name}**. How can I assist you with this device today?`
        : 'Hello! I am your MiUnlocker Assistant. Which Xiaomi, Redmi, or POCO device do you need help with today?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(input, {
        deviceContext: selectedDevice,
        useThinking: useThinking
      });
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        isThinking: useThinking,
        groundingChunks: response.groundingChunks
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const playTTS = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) return; // Already playing (simple prevention)
    
    try {
      setPlayingMessageId(messageId);
      const audioData = await generateSpeech(text);
      if (audioData) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const outputNode = audioContext.createGain();
        outputNode.connect(audioContext.destination);
        
        const audioBuffer = await decodeAudioData(
          decode(audioData),
          audioContext,
          24000,
          1
        );
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        source.onended = () => setPlayingMessageId(null);
        source.start();
      } else {
        setPlayingMessageId(null);
      }
    } catch (e) {
      console.error(e);
      setPlayingMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            AI Technician
          </h3>
          {selectedDevice && (
            <span className="text-xs text-mi-orange mt-0.5 font-medium">
              Active: {selectedDevice.name} ({selectedDevice.code})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={onOpenLive}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold uppercase tracking-wider rounded border border-red-600/30 transition-all animate-pulse"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
             Live Call
           </button>
           <span className="text-xs text-slate-400">Gemini 2.5/3.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap relative group ${
                msg.role === 'user'
                  ? 'bg-mi-orange text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    MiUnlocker AI
                    {msg.isThinking && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded border border-purple-500/30">THOUGHT</span>
                    )}
                  </div>
                  <button 
                    onClick={() => playTTS(msg.id, msg.content)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${playingMessageId === msg.id ? 'text-green-400' : 'text-slate-500 hover:text-white'}`}
                    title="Read aloud"
                  >
                     {playingMessageId === msg.id ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                     )}
                  </button>
                </div>
              )}
              {msg.content}
              
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingChunks.map((chunk, idx) => (
                      chunk.web?.uri && (
                        <a 
                          key={idx} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline bg-blue-400/10 px-2 py-0.5 rounded truncate max-w-[200px]"
                        >
                          {chunk.web.title || new URL(chunk.web.uri).hostname}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                {useThinking && <span className="text-xs text-purple-400 ml-2 animate-pulse">Thinking deeply...</span>}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-2 mb-2">
           <label className="flex items-center gap-2 cursor-pointer group">
             <div className="relative">
               <input 
                 type="checkbox" 
                 checked={useThinking} 
                 onChange={(e) => setUseThinking(e.target.checked)}
                 className="sr-only" 
               />
               <div className={`w-8 h-4 rounded-full transition-colors ${useThinking ? 'bg-purple-600' : 'bg-slate-600'}`}></div>
               <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useThinking ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
             <span className={`text-xs font-medium transition-colors ${useThinking ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
               Deep Reasoning (Gemini 3.0 Pro)
             </span>
           </label>
        </div>
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedDevice ? `Ask about ${selectedDevice.name}...` : "E.g., How to bypass Redmi Note 11..."}
            className="w-full bg-slate-900 text-white placeholder-slate-500 rounded-md py-3 pl-4 pr-12 border border-slate-700 focus:border-mi-orange focus:ring-1 focus:ring-mi-orange outline-none resize-none h-12 overflow-hidden"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 text-mi-orange hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">AI can make mistakes. Always verify method compatibility.</p>
      </div>
    </div>
  );
};

export default ChatInterface;