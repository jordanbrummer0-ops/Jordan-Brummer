import React, { useEffect, useRef, useState } from 'react';
import { getGenAI } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

interface LiveTechnicianModalProps {
  onClose: () => void;
}

const LiveTechnicianModal: React.FC<LiveTechnicianModalProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [isTalking, setIsTalking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Contexts and Nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  
  // Stream ref to cleanup
  const streamRef = useRef<MediaStream | null>(null);
  
  // Session handling
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    connectLiveSession();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(() => {});
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  const connectLiveSession = async () => {
    try {
      const ai = getGenAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setStatus("Connected. Listening...");
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session: any) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsTalking(true);
              if (outputCtx && outputNodeRef.current) {
                 const currentTime = outputCtx.currentTime;
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
                 
                 const audioBuffer = await decodeAudioData(
                   decode(base64Audio),
                   outputCtx,
                   24000,
                   1
                 );
                 
                 const source = outputCtx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNodeRef.current);
                 source.onended = () => {
                   sourcesRef.current.delete(source);
                   if (sourcesRef.current.size === 0) setIsTalking(false);
                 };
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
              }
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsTalking(false);
            }
          },
          onclose: () => {
             setIsConnected(false);
             setStatus("Disconnected");
          },
          onerror: (err) => {
             console.error(err);
             setStatus("Error occurred");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a friendly Xiaomi expert technician. Help users with FRP bypass issues briefly and clearly."
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      
    } catch (e) {
      console.error(e);
      setStatus("Failed to connect: " + e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
        
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${isTalking ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110' : 'bg-slate-800'}`}>
             <div className={`w-24 h-24 rounded-full bg-slate-900 border-2 border-red-500 flex items-center justify-center relative overflow-hidden`}>
                {isTalking ? (
                  <div className="flex gap-1 items-end h-10">
                    <div className="w-2 bg-red-500 animate-[bounce_1s_infinite] h-4"></div>
                    <div className="w-2 bg-red-500 animate-[bounce_1.2s_infinite] h-8"></div>
                    <div className="w-2 bg-red-500 animate-[bounce_0.8s_infinite] h-6"></div>
                    <div className="w-2 bg-red-500 animate-[bounce_1.1s_infinite] h-3"></div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                )}
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Live Technician</h2>
          <p className="text-slate-400 mb-6 text-sm">{status}</p>
          
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all border border-slate-700 hover:border-red-500"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTechnicianModal;