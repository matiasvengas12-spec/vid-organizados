
import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { PokerSpot, PokerVideo } from '../types';

interface VideoUploadModalProps {
  onClose: () => void;
  onUpload: (video: PokerVideo) => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [spot, setSpot] = useState<PokerSpot>(PokerSpot.VS_FISHES);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type.startsWith('video/')) {
        setFile(selected);
        if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
        setError('');
      } else {
        setError('Please select a valid video file.');
        setFile(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const newVideo: PokerVideo = {
      id: Date.now().toString(),
      title,
      spot,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      notes: '',
      timestamps: [],
      createdAt: Date.now()
    };

    onUpload(newVideo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-500" />
            New Study Session
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Video File</label>
            <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
              file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
            }`}>
              {file ? (
                <>
                  <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Change File
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-600 mt-1">MP4, WEBM, MOV supported</p>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Session Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exploiting loose openers BB vs BTN"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400">Study Spot</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PokerSpot).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpot(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                    spot === s 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-slate-400 font-medium hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!file || !title}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all"
            >
              Start Studying
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadModal;
