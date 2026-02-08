
import React from 'react';
import { Play, Calendar, Trash2, Tag, FileVideo } from 'lucide-react';
import { PokerVideo } from '../types';

interface VideoLibraryProps {
  videos: PokerVideo[];
  onSelectVideo: (video: PokerVideo) => void;
  onDeleteVideo: (id: string) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onSelectVideo, onDeleteVideo }) => {
  if (videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center">
        <div className="bg-slate-800/50 p-6 rounded-full mb-6">
          <FileVideo className="w-16 h-16 text-slate-700" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No videos found</h3>
        <p className="max-w-xs leading-relaxed">
          Import your poker training videos and start organizing them by spots.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col shadow-lg shadow-black/20"
          >
            <div 
              className="relative aspect-video bg-slate-800 cursor-pointer overflow-hidden"
              onClick={() => onSelectVideo(video)}
            >
              {/* Overlay with play icon */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                  <Play className="w-6 h-6 fill-white text-white" />
                </div>
              </div>
              
              {/* Badge for Spot */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-slate-900 px-2 py-0.5 rounded shadow-lg">
                  {video.spot}
                </span>
              </div>

              {!video.fileUrl && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  NEEDS RE-LINK
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-semibold text-slate-100 line-clamp-2 mb-2 group-hover:text-emerald-400 transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {video.fileName}
              </p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {video.timestamps.length} hands
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVideo(video.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLibrary;
