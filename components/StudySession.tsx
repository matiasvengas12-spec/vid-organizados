
import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Clock, 
  MessageSquare, 
  Layout, 
  Sparkles,
  Play,
  SkipBack,
  SkipForward,
  ChevronRight
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
  const [activeTab, setActiveTab] = useState<'notes' | 'hands'>('hands');

  // Auto-save notes when they change (debounced could be better but this works)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== video.notes) {
        onUpdateVideo({ ...video, notes });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, video, onUpdateVideo]);

  const addTimestamp = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const newHand: TimestampHand = {
      id: Date.now().toString(),
      time: currentTime,
      label: `Hand at ${formatTime(currentTime)}`,
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
      const prompt = `As a world-class professional poker coach, analyze this spot: ${video.spot}.
      Based on the session title "${video.title}" and existing notes "${notes}", 
      provide 3-5 high-level strategic keys for this specific spot to focus on while reviewing this video. 
      Keep it professional, concise, and focused on ranges and frequencies.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const aiText = response.text || '';
      setNotes(prev => prev + "\n\n--- AI Strategic Insight ---\n" + aiText);
    } catch (error) {
      console.error("AI Gen error", error);
      alert("AI helper unavailable. Check console.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden">
      {/* Left side: Video Player */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <div className="flex items-center gap-4 p-4 bg-slate-900 border-b border-slate-800">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate text-slate-100">{video.title}</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>{video.spot}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span>{video.fileName}</span>
            </div>
          </div>
          <button 
            onClick={addTimestamp}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Tag Hand
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative group">
          <video 
            ref={videoRef}
            src={video.fileUrl} 
            className="max-h-full max-w-full"
            controls
            autoPlay
          />
          
          {/* Custom Shortcut Guide Overlay (visible on hover) */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-[10px] text-slate-300 space-y-1">
              <div className="flex justify-between gap-4"><span>Space</span> <span>Play/Pause</span></div>
              <div className="flex justify-between gap-4"><span>← / →</span> <span>+/- 5s</span></div>
              <div className="flex justify-between gap-4"><span>T</span> <span>Tag Hand</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Study Panel */}
      <div className="w-[450px] border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="flex border-b border-slate-800 shrink-0">
          <button 
            onClick={() => setActiveTab('hands')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'hands' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            Hands ({video.timestamps.length})
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Session Notes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'hands' ? (
            <div className="p-4 space-y-4">
              {video.timestamps.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No hands tagged yet.</p>
                  <p className="text-xs mt-1">Tag interesting hands while watching.</p>
                </div>
              ) : (
                video.timestamps.map((hand) => (
                  <div key={hand.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                    <div className="p-3 flex items-start gap-3 border-b border-slate-700/50">
                      <button 
                        onClick={() => jumpToTime(hand.time)}
                        className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded text-xs font-bold font-mono transition-all flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        {formatTime(hand.time)}
                      </button>
                      <input 
                        type="text" 
                        value={hand.label}
                        onChange={(e) => updateHand(hand.id, { label: e.target.value })}
                        placeholder="Hand label (e.g. AA vs 4bet)"
                        className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-200 focus:text-white"
                      />
                      <button 
                        onClick={() => removeHand(hand.id)}
                        className="p-1 text-slate-600 hover:text-red-400 rounded"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                    <textarea 
                      value={hand.description}
                      onChange={(e) => updateHand(hand.id, { description: e.target.value })}
                      placeholder="Analysis notes for this specific hand..."
                      className="w-full bg-transparent border-none outline-none text-xs p-3 text-slate-400 min-h-[80px] resize-none leading-relaxed focus:text-slate-200 transition-colors"
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Macro Session Strategy</span>
                <button 
                  onClick={generateAiStrategy}
                  disabled={isAiLoading}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                  {isAiLoading ? 'Analyzing...' : 'AI Strategy Help'}
                </button>
              </div>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Overall session takeaways, mistakes, or concepts to remember..."
                className="flex-1 w-full bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
           <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-slate-400 font-medium">Study Mode Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">AUTOSAVE ENABLED</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
