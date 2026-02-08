
import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  MessageSquare, 
  Sparkles,
  Play,
  Trash2,
  ChevronRight,
  Target,
  Zap,
  Info
} from 'lucide-react';
import { PokerVideo, TimestampHand } from '../types';
import { GoogleGenAI } from '@google/genai';

interface StudySessionProps {
  video: PokerVideo;
  onUpdateVideo: (video: PokerVideo) => void;
  onBack: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ video, onUpdateVideo, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [notes, setNotes] = useState(video.notes);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hands' | 'notes'>('hands');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== video.notes) {
        onUpdateVideo({ ...video, notes });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, video, onUpdateVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const addTimestamp = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const newHand: TimestampHand = {
      id: Date.now().toString(),
      time: time,
      label: `Hand @ ${formatTime(time)}`,
      description: ''
    };
    onUpdateVideo({
      ...video,
      timestamps: [...video.timestamps, newHand].sort((a, b) => a.time - b.time)
    });
    setActiveTab('hands');
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const removeHand = (id: string) => {
    onUpdateVideo({
      ...video,
      timestamps: video.timestamps.filter(h => h.id !== id)
    });
  };

  const updateHand = (id: string, updates: Partial<TimestampHand>) => {
    onUpdateVideo({
      ...video,
      timestamps: video.timestamps.map(h => h.id === id ? { ...h, ...updates } : h)
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [
      hrs > 0 ? hrs : null,
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const generateAiStrategy = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a high-stakes poker analyst. The spot is ${video.spot}.
      Session: "${video.title}". Notes: "${notes}".
      Provide 4 specific bullet points of "Focus Objectives" for this study session. 
      Focus on range construction and exploit frequencies. Use concise, professional terminology.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const aiText = response.text || '';
      setNotes(prev => "### STRATEGIC FOCUS\n" + aiText + "\n\n---\n" + prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden">
      {/* LEFT: Video Workspace (60%) */}
      <div className="flex-[3] flex flex-col min-w-0 bg-slate-900/30">
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-slate-100 leading-tight">{video.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold tracking-tighter uppercase">
                  {video.spot}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{video.fileName}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={addTimestamp}
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current group-hover:animate-pulse" />
            TAG CRITICAL HAND
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Main Video Container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
            <video 
              ref={videoRef}
              src={video.fileUrl} 
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
              controls
            />
          </div>

          {/* Video Metadata / Quick Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Playback</p>
                <p className="text-sm font-mono font-bold text-slate-200">{formatTime(currentTime)}</p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tagged Hands</p>
                <p className="text-sm font-bold text-slate-200">{video.timestamps.length} Marks</p>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={generateAiStrategy}>
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI Coach</p>
                <p className="text-sm font-bold text-slate-200">Get Strategies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Analysis Dashboard (40%) */}
      <div className="flex-[2] border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 min-w-[450px]">
        {/* Tabs Navigation */}
        <div className="flex p-2 bg-slate-950 gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('hands')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'hands' ? 'bg-slate-800 text-emerald-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Hand Logs
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'notes' ? 'bg-slate-800 text-emerald-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Global Analysis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          {activeTab === 'hands' ? (
            <>
              {video.timestamps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 py-20">
                  <div className="p-6 bg-slate-800/30 rounded-full">
                    <Zap className="w-12 h-12 opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">No hands tagged</p>
                    <p className="text-xs">Click "Tag Critical Hand" during key moments</p>
                  </div>
                </div>
              ) : (
                video.timestamps.map((hand) => {
                  const isActive = Math.abs(currentTime - hand.time) < 5;
                  return (
                    <div 
                      key={hand.id} 
                      className={`group border rounded-2xl transition-all duration-300 ${
                        isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20' 
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <button 
                            onClick={() => jumpToTime(hand.time)}
                            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-black font-mono transition-all ${
                              isActive ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            <Play className={`w-3 h-3 ${isActive ? 'fill-slate-900' : 'fill-slate-300'}`} />
                            {formatTime(hand.time)}
                          </button>
                          <div className="flex items-center gap-1">
                            {isActive && (
                              <span className="text-[9px] font-bold text-emerald-400 animate-pulse mr-2">CURRENT SCENE</span>
                            )}
                            <button 
                              onClick={() => removeHand(hand.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <input 
                          type="text" 
                          value={hand.label}
                          onChange={(e) => updateHand(hand.id, { label: e.target.value })}
                          className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-100 placeholder:text-slate-600 mb-2"
                          placeholder="Hand Title (e.g. Hero open 2.5bb BTN)"
                        />
                        
                        <div className="relative">
                          <textarea 
                            value={hand.description}
                            onChange={(e) => updateHand(hand.id, { description: e.target.value })}
                            className="w-full bg-slate-950/40 rounded-xl p-3 text-xs text-slate-400 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all min-h-[90px] resize-none leading-relaxed"
                            placeholder="Detail range analysis, villian reads, or EV considerations..."
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Info className="w-3 h-3 text-slate-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div className="h-full flex flex-col gap-4">
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
                 <div className="flex items-center gap-2 mb-3">
                   <Sparkles className="w-4 h-4 text-indigo-400" />
                   <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Master Session Goals</h4>
                 </div>
                 <p className="text-[11px] text-slate-400 leading-relaxed mb-4 italic">
                   Define your overall strategy for this spot. Use the AI Assistant to generate a baseline.
                 </p>
                 <button 
                  onClick={generateAiStrategy}
                  disabled={isAiLoading}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {isAiLoading ? 'Synthesizing...' : 'Request AI Strategic Keys'}
                </button>
              </div>

              <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800/50 p-4 relative overflow-hidden group">
                <div className="absolute top-4 right-4 pointer-events-none opacity-10 group-focus-within:opacity-30 transition-opacity">
                   <Target className="w-24 h-24 text-white" />
                </div>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none text-sm text-slate-300 resize-none leading-loose font-medium"
                  placeholder="Start writing your master analysis here..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
           <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               SESSION RECORDING: SYNCED
             </div>
             <div className="flex items-center gap-1">
               AUTO-SAVING <ChevronRight className="w-3 h-3" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
