
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Plus, 
  Folder, 
  Clock, 
  FileText, 
  Trash2, 
  ChevronRight, 
  Layout, 
  Search,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PokerSpot, PokerVideo, TimestampHand } from './types';
import Sidebar from './components/Sidebar';
import VideoLibrary from './components/VideoLibrary';
import StudySession from './components/StudySession';
import VideoUploadModal from './components/VideoUploadModal';

const STORAGE_KEY = 'poker_study_v1';

const App: React.FC = () => {
  const [videos, setVideos] = useState<PokerVideo[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<PokerSpot | 'All'>('All');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Note: Blob URLs won't persist, user must re-link or we handle missing files
        setVideos(parsed.map((v: PokerVideo) => ({ ...v, fileUrl: undefined })));
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    const dataToSave = videos.map(v => ({
      ...v,
      fileUrl: undefined // Don't save transient blob URLs
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [videos]);

  const activeVideo = useMemo(() => 
    videos.find(v => v.id === activeVideoId), 
    [videos, activeVideoId]
  );

  const handleAddVideo = (newVideo: PokerVideo) => {
    setVideos(prev => [newVideo, ...prev]);
    setIsUploadModalOpen(false);
  };

  const handleUpdateVideo = (updatedVideo: PokerVideo) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm("Delete this video and all associated notes?")) {
      setVideos(prev => prev.filter(v => v.id !== id));
      if (activeVideoId === id) setActiveVideoId(null);
    }
  };

  const filteredVideos = useMemo(() => {
    if (selectedSpot === 'All') return videos;
    return videos.filter(v => v.spot === selectedSpot);
  }, [videos, selectedSpot]);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Sidebar - Navigation */}
      <Sidebar 
        selectedSpot={selectedSpot} 
        onSelectSpot={(spot) => {
          setSelectedSpot(spot);
          setActiveVideoId(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedSpot === 'All' ? 'All Sessions' : selectedSpot}
            </h1>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400 border border-slate-700">
              {filteredVideos.length} Videos
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search hands..." 
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all w-48 focus:w-64"
              />
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              New Video
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeVideo ? (
            <StudySession 
              video={activeVideo} 
              onUpdateVideo={handleUpdateVideo}
              onBack={() => setActiveVideoId(null)}
            />
          ) : (
            <VideoLibrary 
              videos={filteredVideos} 
              onSelectVideo={(v) => {
                // If video has no URL (loaded from storage), ask to re-link file
                if (!v.fileUrl) {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      handleUpdateVideo({ ...v, fileUrl: url });
                      setActiveVideoId(v.id);
                    }
                  };
                  input.click();
                } else {
                  setActiveVideoId(v.id);
                }
              }}
              onDeleteVideo={handleDeleteVideo}
            />
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <VideoUploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={handleAddVideo}
        />
      )}
    </div>
  );
};

export default App;
